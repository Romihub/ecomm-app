# Build stage
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy all files
COPY . .

# Build the app
RUN npm run build

# Expose port (Vite default)
# EXPOSE 5173
EXPOSE 4173

# Start the application using preview mode
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0", "--port", "4173"]