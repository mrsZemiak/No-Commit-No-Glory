# Use Node.js version
FROM node:20

# Create and set the working directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the source code
COPY . .

# Expose the port for the backend
EXPOSE 3000

# Start the backend server
CMD ["npx", "ts-node", "src/server.ts"]