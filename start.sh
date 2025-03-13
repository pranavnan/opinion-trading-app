#!/bin/bash

# Ensure the dist directory is up to date
echo "Building the project..."
npm run build

# Start the server with WebSocket debug flags
echo "Starting the server with WebSocket debugging..."
DEBUG=socket.io* node dist/index.js 