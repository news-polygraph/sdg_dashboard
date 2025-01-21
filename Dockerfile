# Use an official Node runtime as a parent image
FROM node:16

# Set the working directory in the container
WORKDIR /

# Copy package.json and package-lock.json
COPY package*.json ./

RUN rm -rf node_modules package-lock.json

# Install any needed packages
RUN npm cache clean --force
RUN npm install
# remove duplicates in packages folder
RUN npm dedupe 
RUN npm update

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