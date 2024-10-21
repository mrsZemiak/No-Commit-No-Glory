# Use Node.js version 16 (you can change this based on your needs)
FROM node:16-alpine

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

# Start the app
CMD ["npm", "start"]