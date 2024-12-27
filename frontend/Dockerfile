# Step 1: Build stage
FROM node:20 AS build-stage

WORKDIR /app
COPY package*.json ./
RUN npm install

# Copy all source code
COPY . .

# Build the frontend
RUN npm install -g npm-run-all # Ensure npm-run-all is installed
RUN npm run build

# Step 2: Production stage
FROM nginx:alpine AS production-stage

# Copy built files from the build stage
COPY --from=build-stage /app/dist /usr/share/nginx/html

# Expose the default NGINX port
EXPOSE 80

# Start NGINX
CMD ["nginx", "-g", "daemon off;"]