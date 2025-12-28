#!/usr/bin/env node

/**
 * Docker Installation Check Script
 * Checks if Docker is installed and provides installation instructions
 */

import { execSync } from 'child_process';
import { spawn } from 'child_process';
import os from 'os';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkDocker() {
  try {
    execSync('docker --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkDockerCompose() {
  try {
    execSync('docker compose version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function checkDockerRunning() {
  try {
    execSync('docker info', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function getInstallInstructions() {
  const platform = os.platform();
  
  if (platform === 'win32') {
    return {
      title: 'Install Docker Desktop for Windows',
      steps: [
        '1. Download Docker Desktop:',
        '   https://www.docker.com/products/docker-desktop/',
        '',
        '2. Run the installer (Docker Desktop Installer.exe)',
        '',
        '3. Follow the installation wizard',
        '',
        '4. Restart your computer if prompted',
        '',
        '5. Start Docker Desktop from the Start menu',
        '',
        '6. Wait for Docker Desktop to fully start (whale icon in system tray)',
        '',
        '7. Run this command again: pnpm postgres:up',
      ],
      downloadUrl: 'https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe',
    };
  } else if (platform === 'darwin') {
    return {
      title: 'Install Docker Desktop for Mac',
      steps: [
        '1. Download Docker Desktop:',
        '   https://www.docker.com/products/docker-desktop/',
        '',
        '2. Open the downloaded .dmg file',
        '',
        '3. Drag Docker to Applications folder',
        '',
        '4. Open Docker from Applications',
        '',
        '5. Wait for Docker Desktop to fully start',
        '',
        '6. Run this command again: pnpm postgres:up',
      ],
      downloadUrl: 'https://desktop.docker.com/mac/main/amd64/Docker.dmg',
    };
  } else {
    return {
      title: 'Install Docker for Linux',
      steps: [
        '1. Install Docker Engine:',
        '   Ubuntu/Debian:',
        '   sudo apt-get update',
        '   sudo apt-get install docker.io docker-compose',
        '',
        '2. Start Docker service:',
        '   sudo systemctl start docker',
        '   sudo systemctl enable docker',
        '',
        '3. Add your user to docker group (optional):',
        '   sudo usermod -aG docker $USER',
        '   (logout and login again)',
        '',
        '4. Run this command again: pnpm postgres:up',
      ],
      downloadUrl: 'https://docs.docker.com/engine/install/',
    };
  }
}

function main() {
  log('\n🐳 Docker Installation Check\n', 'blue');

  // Check Docker installation
  log('Checking Docker installation...', 'yellow');
  const dockerInstalled = checkDocker();
  
  if (!dockerInstalled) {
    log('❌ Docker is not installed', 'red');
    log('\n' + '='.repeat(60), 'cyan');
    
    const instructions = getInstallInstructions();
    log(`\n${instructions.title}`, 'yellow');
    log('\nSteps:', 'cyan');
    instructions.steps.forEach(step => log(`  ${step}`, 'blue'));
    
    log('\n' + '='.repeat(60), 'cyan');
    log('\n💡 Quick Install:', 'yellow');
    log(`   Download: ${instructions.downloadUrl}`, 'blue');
    log('\n📚 Documentation:', 'yellow');
    log('   https://docs.docker.com/get-docker/', 'blue');
    log('\n');
    process.exit(1);
  }

  log('✅ Docker is installed', 'green');
  
  // Check Docker Compose
  const dockerComposeAvailable = checkDockerCompose();
  if (dockerComposeAvailable) {
    log('✅ Docker Compose is available', 'green');
  } else {
    log('⚠️  Docker Compose not found (using docker-compose)', 'yellow');
  }

  // Check if Docker is running
  log('\nChecking Docker daemon...', 'yellow');
  const dockerRunning = checkDockerRunning();
  
  if (!dockerRunning) {
    log('❌ Docker is not running', 'red');
    log('\nPlease start Docker Desktop:', 'yellow');
    log('  - Windows: Search for "Docker Desktop" in Start menu', 'blue');
    log('  - Mac: Open Docker from Applications', 'blue');
    log('  - Linux: sudo systemctl start docker', 'blue');
    log('\nWait for Docker to fully start, then try again.\n', 'yellow');
    process.exit(1);
  }

  log('✅ Docker is running', 'green');
  
  // Get Docker version
  try {
    const version = execSync('docker --version', { encoding: 'utf-8' }).trim();
    log(`\n📦 ${version}`, 'cyan');
  } catch {
    // Ignore
  }

  log('\n✅ Docker is ready to use!', 'green');
  log('\nYou can now run:', 'yellow');
  log('  pnpm postgres:up    - Start PostgreSQL', 'blue');
  log('  pnpm postgres:test  - Test PostgreSQL connection', 'blue');
  log('\n');
}

main().catch((error) => {
  log(`\n❌ Error: ${error.message}`, 'red');
  process.exit(1);
});

