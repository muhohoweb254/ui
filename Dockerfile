# Stage 1: Build the Angular app
FROM node:20-alpine AS build

 # Set the working directory
WORKDIR /app

 # Copy package.json and package-lock.json
COPY package*.json ./

 # Install dependencies
RUN npm ci

 # Copy the Angular project files
COPY . .

 # Accept a build argument for the environment (default to production)
ARG ENV=production
 #ARG ENV=production
 #development

 # Build the Angular app based on the passed environment configuration
RUN npm run build -- --configuration production

 # Stage 2: Serve the app with Nginx
FROM nginx:alpine

 # Install gettext package which provides envsubst for replacing env variables in JS files
RUN apk add --no-cache gettext

 # Copy the built Angular files from Stage 1
COPY --from=build /app/dist/sakai-ng /usr/share/nginx/html

 # Create a directory for the config file
RUN mkdir -p /usr/share/nginx/html/config

 # Copy the initial config.template.js and the shell script for variable substitution
COPY config.template.js /usr/share/nginx/html/config/config.template.js
COPY substitute_env.sh /usr/share/nginx/html


 # Grant execution permissions to the script
RUN chmod +x /usr/share/nginx/html/substitute_env.sh

 # Set environment variables (these will be replaced in config.template.js at runtime)
ENV LIBRARY_IMAGE="v1.0.0"
ENV STUDENTS_IMAGE="v1.0.0"
ENV UI_IMAGE="v1.0.0"

 # Copy the custom nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf


EXPOSE 80

CMD ["/bin/sh", "-c", "/usr/share/nginx/html/substitute_env.sh && nginx -g 'daemon off;'"]
