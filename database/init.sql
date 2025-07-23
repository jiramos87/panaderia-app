-- Script de inicialización para PostgreSQL en Docker
-- Este script se ejecuta automáticamente cuando el contenedor se crea por primera vez

-- Crear usuario específico para la aplicación (práctica de seguridad)
CREATE USER panaderia_user WITH ENCRYPTED PASSWORD 'panaderia_password';

-- Otorgar privilegios necesarios
GRANT ALL PRIVILEGES ON DATABASE panaderia_local TO panaderia_user;

-- Conectar a la base de datos de la aplicación
\c panaderia_local;

-- Otorgar privilegios sobre el esquema público
GRANT ALL PRIVILEGES ON SCHEMA public TO panaderia_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO panaderia_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO panaderia_user;

-- Configuraciones adicionales para desarrollo
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO panaderia_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO panaderia_user;
