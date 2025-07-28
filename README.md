# Panadería App Deployment Commands

# 1. Clone repository and install dependencies
git clone https://github.com/jiramos87/panaderia-app.git
cd panaderia-app
# Run: npm install in both frontend/ and backend/ directories, then return to panaderia-app/

# 2. Set environment variables (update REGION based on your lab assignment)
INSTANCE_NAME=postgres-instance
DATABASE_NAME=mydatabase
REGION=us-west1

# 3. Create Cloud SQL PostgreSQL instance
gcloud sql instances create $INSTANCE_NAME \
  --database-version POSTGRES_17 \
  --tier db-g1-small \
  --region $REGION \
  --edition=ENTERPRISE

# 4. Create database
gcloud sql databases create $DATABASE_NAME \
  --instance $INSTANCE_NAME

# 5. Create password file (critical: no newline to avoid auth issues)
echo -n "panaderia_password" > dbpassword

# 6. Create database user
gcloud sql users create qwiklabs_user \
   --instance=$INSTANCE_NAME --password=$(cat dbpassword)

# 7. Create storage bucket for static assets
BUCKET_NAME=$DEVSHELL_PROJECT_ID-ruby
gsutil mb -l $REGION gs://$BUCKET_NAME

# 8. Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# 9. Create secret for database password
gcloud secrets create db-password --data-file=dbpassword

# 10. Verify secret creation (optional)
gcloud secrets describe db-password
gcloud secrets versions access latest --secret db-password

# 11. Get project number for IAM bindings
PROJECT_NUMBER=$(gcloud projects describe $DEVSHELL_PROJECT_ID --format='value(projectNumber)')

# 12. Set IAM permissions for secret access
gcloud secrets add-iam-policy-binding db-password \
  --member serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com \
  --role roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding db-password \
  --member serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role roles/secretmanager.secretAccessor

# 13. Grant Cloud SQL client permissions
gcloud projects add-iam-policy-binding $DEVSHELL_PROJECT_ID \
  --member serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role roles/cloudsql.client

# 14. Create Artifact Registry repository
gcloud artifacts repositories create cloud-run-source-deploy \
  --repository-format=docker \
  --location=$REGION

# 15. Enable Cloud Run API
gcloud services enable run.googleapis.com

# 16. Build backend Docker image
echo "🔧 Building backend image..."
docker build -t $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-backend ./backend

# 17. Push backend image to registry
echo "📤 Pushing backend image..."
docker push $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-backend

# 18. Deploy backend to Cloud Run
echo "🚀 Deploying backend..."
gcloud run deploy panaderia-backend \
  --platform managed \
  --region $REGION \
  --image $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-backend \
  --add-cloudsql-instances $DEVSHELL_PROJECT_ID:$REGION:$INSTANCE_NAME \
  --allow-unauthenticated \
  --port=8080 \
  --memory=1Gi \
  --set-env-vars="NODE_ENV=production,DB_HOST=/cloudsql/$DEVSHELL_PROJECT_ID:$REGION:$INSTANCE_NAME,DB_PORT=5432,DB_NAME=$DATABASE_NAME,DB_USER=qwiklabs_user,DB_DIALECT=postgres" \
  --set-secrets="DB_PASSWORD=db-password:latest" \
  --max-instances=3

# 19. Get backend URL and configure frontend
echo "🔗 Setting up frontend API URL..."
BACKEND_URL=$(gcloud run services describe panaderia-backend --region=$REGION --format="value(status.url)")
echo "REACT_APP_API_URL=$BACKEND_URL/api" > frontend/.env

# 20. Build frontend Docker image (with correct API URL)
echo "🔧 Building frontend image..."
docker build -t $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-frontend ./frontend

# 21. Push frontend image to registry
echo "📤 Pushing frontend image..."
docker push $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-frontend

# 22. Deploy frontend to Cloud Run
echo "🚀 Deploying frontend..."
gcloud run deploy panaderia-frontend \
  --platform managed \
  --region $REGION \
  --image $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-frontend \
  --allow-unauthenticated \
  --port=8080 \
  --memory=512Mi \
  --max-instances=3

# 23. Display deployment URLs
echo "✅ Deployment complete!"
echo "Backend API: $BACKEND_URL/api/products"
echo "Frontend App: $(gcloud run services describe panaderia-frontend --region=$REGION --format="value(status.url)")"
