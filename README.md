# Panadería App - Google Cloud Serverless Deployment

A full-stack bakery e-commerce application built with Node.js backend and React frontend, deployed on Google Cloud using serverless technologies (Cloud Run + Cloud SQL).

## Features

- 🥖 Product catalog with bakery items
- 🛒 Shopping cart functionality
- 📋 Order management
- 🔐 Secure database with Secret Manager
- 🚀 Serverless deployment on Google Cloud
- 🐳 Containerized with Docker

## Tech Stack

**Backend:**
- Node.js with Express
- Sequelize ORM
- PostgreSQL (Cloud SQL)
- Secret Manager for password security

**Frontend:**
- React 19
- Axios for API calls
- Responsive CSS design

**Infrastructure:**
- Google Cloud Run (serverless containers)
- Cloud SQL (PostgreSQL)
- Artifact Registry (Docker images)
- Secret Manager (secure credentials)

## Prerequisites

- Google Cloud Platform account with billing enabled
- GCP lab environment or Cloud Shell access
- Git installed

## Quick Deployment

Copy and paste the following commands into your GCP Cloud Shell:

```bash
# Panadería App Deployment - Copy and paste all commands below

# Clone repository and install dependencies
git clone https://github.com/jiramos87/panaderia-app.git
cd panaderia-app

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend && npm install && cd ..

# Install frontend dependencies  
echo "📦 Installing frontend dependencies..."
cd frontend && npm install && cd ..

# Set environment variables (update REGION based on your lab assignment)
INSTANCE_NAME=postgres-instance
DATABASE_NAME=mydatabase
REGION=us-west1

# Create Cloud SQL PostgreSQL instance
gcloud sql instances create $INSTANCE_NAME --database-version POSTGRES_17 --tier db-g1-small --region $REGION --edition=ENTERPRISE

# Create database
gcloud sql databases create $DATABASE_NAME --instance $INSTANCE_NAME

# Create password file (critical: no newline to avoid auth issues)
echo -n "panaderia_password" > dbpassword

# Create database user
gcloud sql users create qwiklabs_user --instance=$INSTANCE_NAME --password=$(cat dbpassword)

# Create storage bucket for static assets
BUCKET_NAME=$DEVSHELL_PROJECT_ID-ruby
gsutil mb -l $REGION gs://$BUCKET_NAME

# Set bucket permissions
gsutil iam ch allUsers:objectViewer gs://$BUCKET_NAME

# Create secret for database password
gcloud secrets create db-password --data-file=dbpassword

# Get project number for IAM bindings
PROJECT_NUMBER=$(gcloud projects describe $DEVSHELL_PROJECT_ID --format='value(projectNumber)')

# Set IAM permissions for secret access
gcloud secrets add-iam-policy-binding db-password --member serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com --role roles/secretmanager.secretAccessor

gcloud secrets add-iam-policy-binding db-password --member serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com --role roles/secretmanager.secretAccessor

# Grant Cloud SQL client permissions
gcloud projects add-iam-policy-binding $DEVSHELL_PROJECT_ID --member serviceAccount:$PROJECT_NUMBER@cloudbuild.gserviceaccount.com --role roles/cloudsql.client

# Create Artifact Registry repository
gcloud artifacts repositories create cloud-run-source-deploy --repository-format=docker --location=$REGION

# Enable Cloud Run API
gcloud services enable run.googleapis.com

# Build and push backend
echo "🔧 Building backend image..."
docker build -t $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-backend ./backend

echo "📤 Pushing backend image..."
docker push $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-backend

# Deploy backend to Cloud Run
echo "🚀 Deploying backend..."
gcloud run deploy panaderia-backend --platform managed --region $REGION --image $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-backend --add-cloudsql-instances $DEVSHELL_PROJECT_ID:$REGION:$INSTANCE_NAME --allow-unauthenticated --port=8080 --memory=1Gi --set-env-vars="NODE_ENV=production,DB_HOST=/cloudsql/$DEVSHELL_PROJECT_ID:$REGION:$INSTANCE_NAME,DB_PORT=5432,DB_NAME=$DATABASE_NAME,DB_USER=qwiklabs_user,DB_DIALECT=postgres" --set-secrets="DB_PASSWORD=db-password:latest" --max-instances=3

# Configure frontend with backend URL
echo "🔗 Setting up frontend API URL..."
BACKEND_URL=$(gcloud run services describe panaderia-backend --region=$REGION --format="value(status.url)")
echo "REACT_APP_API_URL=$BACKEND_URL/api" > frontend/.env

# Build and push frontend
echo "🔧 Building frontend image..."
docker build -t $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-frontend ./frontend

echo "📤 Pushing frontend image..."
docker push $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-frontend

# Deploy frontend to Cloud Run
echo "🚀 Deploying frontend..."
gcloud run deploy panaderia-frontend --platform managed --region $REGION --image $REGION-docker.pkg.dev/$DEVSHELL_PROJECT_ID/cloud-run-source-deploy/panaderia-frontend --allow-unauthenticated --port=8080 --memory=512Mi --max-instances=3

# Display final URLs
echo "✅ Deployment complete!"
echo "Backend API: $BACKEND_URL/api/products"
FRONTEND_URL=$(gcloud run services describe panaderia-frontend --region=$REGION --format="value(status.url)")
echo "Frontend App: $FRONTEND_URL"
```

## Important Notes

### Before Deployment
- **Update REGION variable**: Change `us-west1` to match your lab's assigned region
- **Verify lab permissions**: Ensure you have sufficient permissions in your GCP lab environment

### Key Architecture Decisions
- **Password Security**: Uses `echo -n` to avoid newline issues that cause authentication failures
- **CORS Configuration**: Backend allows all origins (`origin: true`) for simplicity
- **SSL Configuration**: Disabled for Cloud SQL Unix socket connections (handled by proxy)
- **Build Order**: Backend must be deployed before frontend to get the API URL

### Troubleshooting
- **Frontend not loading products**: Check browser console for CORS errors
- **Database connection issues**: Verify password file creation and Secret Manager setup
- **Build failures**: Ensure npm dependencies are installed in both directories

## Testing the Deployment

After successful deployment, you can test:

1. **Backend API**: Visit `[BACKEND_URL]/api/products` to see the product list
2. **Frontend App**: Visit `[FRONTEND_URL]` to use the full application
3. **Health Check**: Visit `[BACKEND_URL]/health` for backend status

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │    │   Express API    │    │   PostgreSQL    │
│  (Cloud Run)    │───▶│  (Cloud Run)     │───▶│  (Cloud SQL)    │
│   Frontend      │    │    Backend       │    │    Database     │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## License

MIT License - Feel free to use this project for learning and development purposes.