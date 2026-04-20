#!/bin/bash

echo "========================================"
echo "MUUA Gallery - Backend Setup & Run"
echo "========================================"
echo ""

# Check if Maven is installed
if ! command -v mvn &> /dev/null; then
    echo "ERROR: Maven is not installed or not in PATH"
    echo "Please install Maven from: https://maven.apache.org/download.cgi"
    exit 1
fi

echo "Maven found!"
echo ""

# Check if Java is installed
if ! command -v java &> /dev/null; then
    echo "ERROR: Java is not installed or not in PATH"
    echo "Please install Java 17+ from: https://www.oracle.com/java/technologies/downloads/"
    exit 1
fi

echo "Java found!"
echo ""

echo "========================================"
echo "Step 1: Cleaning and installing dependencies"
echo "========================================"
mvn clean install

if [ $? -ne 0 ]; then
    echo "ERROR: Maven build failed"
    exit 1
fi

echo ""
echo "========================================"
echo "Step 2: Starting Spring Boot Application"
echo "========================================"
echo ""
echo "Backend running on: http://localhost:8080/api"
echo "Press Ctrl+C to stop the server"
echo ""

mvn spring-boot:run
