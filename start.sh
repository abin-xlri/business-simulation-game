#!/bin/bash
set -e

# Create the web root directory
mkdir -p /var/www/html

# Copy the built frontend assets
cp -r /tmp/frontend-dist/* /var/www/html/

# Start Nginx in the background to serve the frontend
nginx -g "daemon off;" &

# Start the backend Node.js server
node backend/dist/src/index.js