@echo off
REM PostgreSQL Start Script for Windows
echo Starting PostgreSQL...
docker compose up -d postgres
if %errorlevel% equ 0 (
    echo.
    echo PostgreSQL started successfully!
    echo Waiting for PostgreSQL to be ready...
    timeout /t 5 /nobreak >nul
    docker compose ps postgres
    echo.
    echo To connect: pnpm postgres:shell
    echo To view logs: pnpm postgres:logs
) else (
    echo.
    echo Failed to start PostgreSQL.
    echo Make sure Docker Desktop is running.
)


