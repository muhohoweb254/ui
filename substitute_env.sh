#!/bin/sh

# Define the root directory where the files are located
ROOT_DIR=/usr/share/nginx/html/config

# Echo the initial state of the config.template.js file
echo "Initial config.template.js content:"
cat $ROOT_DIR/config.template.js

# Use envsubst to replace environment variables in the template and output to config.js
envsubst < $ROOT_DIR/config.template.js > $ROOT_DIR/config.js

# Echo the resulting config.js file to verify substitution
echo "Generated config.js content:"

# Copy the generated config.js to the browser directory
cp $ROOT_DIR/config.js /usr/share/nginx/html/browser/config.js
cat /usr/share/nginx/html/browser/config.js
rm -r /usr/share/nginx/html/config
