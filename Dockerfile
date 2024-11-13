# Use an official Node runtime as a parent image
FROM node:14

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

# Install any needed packages
RUN npm install

# Bundle app source
COPY . .

ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL=${REACT_APP_BACKEND_URL}

# Build for production.
RUN npm run build

# Install `serve` to run the application.
RUN npm install -g serve

# Make port 3000 available to the world outside this container
EXPOSE 8000

# Run `serve` to serve the application on port 8000
CMD ["serve", "-s", "build", "-l", "8000"]