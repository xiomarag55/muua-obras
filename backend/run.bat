@echo off
echo ===============================================
echo MUUA Gallery - Backend Setup & Run
echo ===============================================
echo.

:: Check if Maven is installed
mvn --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Maven is not installed or not in PATH
    echo Please install Maven from: https://maven.apache.org/download.cgi
    echo Or ensure Maven is added to your PATH
    pause
    exit /b 1
)

echo Maven found!
echo.

:: Check if Java is installed
java -version > nul 2>&1
if errorlevel 1 (
    echo ERROR: Java is not installed or not in PATH
    echo Please install Java 17+ from: https://www.oracle.com/java/technologies/downloads/
    pause
    exit /b 1
)

echo Java found!
echo.

echo ===============================================
echo Step 1: Cleaning and installing dependencies
echo ===============================================
call mvn clean install

if errorlevel 1 (
    echo ERROR: Maven build failed
    pause
    exit /b 1
)

echo.
echo ===============================================
echo Step 2: Starting Spring Boot Application
echo ===============================================
echo.
echo Backend running on: http://localhost:8080/api
echo Press Ctrl+C to stop the server
echo.

call mvn spring-boot:run

pause
