# Use Node.js version
FROM node:20

# Create and set the working directory
WORKDIR /usr/src/app

# Copy packages for dependencies installation first
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code to container
COPY . .

# Expose the port for app run
EXPOSE 3000

# Start the application using server.ts
CMD ["npx", "ts-node", "src/server.ts"]