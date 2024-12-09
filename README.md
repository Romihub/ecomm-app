# RomiHub Store - E-commerce Platform

## System Architecture

### Microservices
1. **Auth Service** (Port 3001)
   - Handles user authentication and authorization
   - JWT token management
   - Session management with Azure Cache for Redis

2. **Catalog Service** (Port 3002)
   - Product management
   - Category management
   - Product search and filtering
   - Caching with Azure Cache for Redis

3. **Payment Service** (Port 3003)
   - Payment processing with Stripe
   - Order creation
   - Payment status management

4. **Orders Service** (Port 3004)
   - Order management
   - Order history
   - Stock management

5. **Frontend Service** (Port 5173)
   - React application
   - User interface
   - Cart management with Zustand

### Azure Services Required

1. **Azure Kubernetes Service (AKS)**
   - Container orchestration
   - Load balancing
   - Service scaling

2. **Azure Cache for Redis**
   - Session management
   - Product caching
   - Cart data caching

3. **Azure Database for PostgreSQL**
   - Product catalog
   - User data
   - Order information
   - Inventory management

4. **Azure Container Registry (ACR)**
   - Docker image storage
   - Image versioning

5. **Azure Monitor**
   - Application insights
   - Performance monitoring
   - Log analytics

## Prerequisites

1. Azure CLI installed
2. kubectl installed
3. Docker installed
4. Node.js 18+ installed
5. Azure subscription

## Local Development Setup

```bash
# Clone the repository
git clone repo
cd ecomm-app

# Install dependencies for all services
npm install

# Set up environment variables
cp .env.example .env

# Start all services locally
npm run dev
```

## Environment Variables

Create a `.env` file in each service directory:

```env
# Frontend (.env)
VITE_API_URL=http://localhost:3000
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_key

# Auth Service (.env)
JWT_SECRET=your_jwt_secret
REDIS_CONNECTION_STRING=your_azure_redis_connection_string
DATABASE_URL=your_azure_postgres_connection_string

# Catalog Service (.env)
DATABASE_URL=your_azure_postgres_connection_string
REDIS_CONNECTION_STRING=your_azure_redis_connection_string

# Payment Service (.env)
STRIPE_SECRET_KEY=your_stripe_secret_key
REDIS_CONNECTION_STRING=your_azure_redis_connection_string

# Orders Service (.env)
DATABASE_URL=your_azure_postgres_connection_string
REDIS_CONNECTION_STRING=your_azure_redis_connection_string
```

## Azure Deployment Steps

### 1. Create Azure Resources

```bash
# Login to Azure
az login

# Create Resource Group
az group create --name romihub-store --location eastus

# Create AKS Cluster
az aks create \
  --resource-group ecomm-store \
  --name ecomm-aks \
  --node-count 3 \
  --enable-addons monitoring \
  --generate-ssh-keys

# Create Azure Container Registry
az acr create \
  --resource-group ecomm-store \
  --name ecommacr \
  --sku Standard

# Create Azure Database for PostgreSQL
az postgres flexible-server create \
  --resource-group ecomm-store \
  --name ecomm-db \
  --location eastus \
  --admin-user <user-name> \
  --admin-password "<password>"

# Create Azure Cache for Redis
az redis create \
  --resource-group ecomm-store \
  --name ecomm-redis \
  --sku Basic \
  --vm-size c0
```

### 2. Build and Push Docker Images

```bash
# Login to ACR
az acr login --name romihubacr

# Build and push images
docker build -t ecommacr.azurecr.io/auth-service:v1 ./services/auth
docker build -t ecommacr.azurecr.io/catalog-service:v1 ./services/catalog
docker build -t ecommacr.azurecr.io/payment-service:v1 ./services/payment
docker build -t ecommacr.azurecr.io/orders-service:v1 ./services/orders
docker build -t ecommacr.azurecr.io/frontend:v1 ./frontend

# Push images
docker push ecommacr.azurecr.io/auth-service:v1
docker push ecommacr.azurecr.io/frontend:v1
```

### 3. Deploy to Kubernetes

```bash
# Get AKS credentials
az aks get-credentials --resource-group ecomm-store --name ecomm-aks

# Apply Kubernetes configurations individually
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secrets.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/services/
kubectl apply -f k8s/deployments/
.....

Or apply all at once
kubectl apply -f .

```

## Database Migration

```bash
# Connect to PostgreSQL database
export DATABASE_URL="postgresql://adminuser:YourSecurePassword123!@ecomm-db.postgres.database.azure.com:5432/ecommhubdb"

# Run migrations
npm run migrate