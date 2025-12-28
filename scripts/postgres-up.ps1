# PostgreSQL Start Script for PowerShell
Write-Host "Starting PostgreSQL..." -ForegroundColor Yellow

try {
    docker compose up -d postgres
    if ($LASTEXITCODE -eq 0) {
        Write-Host "`nPostgreSQL started successfully!" -ForegroundColor Green
        Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        docker compose ps postgres
        Write-Host "`nTo connect: pnpm postgres:shell" -ForegroundColor Cyan
        Write-Host "To view logs: pnpm postgres:logs" -ForegroundColor Cyan
    } else {
        Write-Host "`nFailed to start PostgreSQL." -ForegroundColor Red
        Write-Host "Make sure Docker Desktop is running." -ForegroundColor Yellow
    }
} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "Make sure Docker Desktop is installed and running." -ForegroundColor Yellow
}


