# Use an official Node.js image as the base image
FROM node:20-alpine3.20

# Set the working directory in the container
WORKDIR /app

# Copy the rest of the application code
COPY . .

# Install dependencies
RUN npm install

# Expose Vite’s default development port (usually 5173)
EXPOSE 5173

# Enable polling for file changes
ENV CHOKIDAR_USEPOLLING=true

# Start the Vite dev server
CMD ["npm", "start"]
