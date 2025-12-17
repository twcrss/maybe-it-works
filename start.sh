#!/bin/bash

echo "Starting local server..."
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3 server..."
    python3 server.py
elif command -v python &> /dev/null; then
    echo "Using Python server..."
    python server.py
# Check if Node.js is available
elif command -v node &> /dev/null; then
    echo "Using Node.js server..."
    node server.js
else
    echo "Error: Neither Python nor Node.js found!"
    echo "Please install Python or Node.js to run the server."
    echo ""
    echo "Alternatively, you can:"
    echo "1. Install Python: sudo apt-get install python3"
    echo "2. Install Node.js: https://nodejs.org/"
    echo "3. Use VS Code with Live Server extension"
    exit 1
fi

