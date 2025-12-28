#!/usr/bin/env node

/**
 * PostgreSQL Connection Test Script
 * Tests connection to PostgreSQL database configured in docker-compose.yaml
 */

import { execSync } from 'child_process';
import { spawn } from 'child_process';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
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

function checkPostgresRunning() {
  try {
    const output = execSync('docker compose ps postgres', { encoding: 'utf-8' });
    return output.includes('8no-ai-postgres') && output.includes('Up');
  } catch {
    return false;
  }
}

function testConnection() {
  return new Promise((resolve) => {
    const psql = spawn('docker', [
      'compose',
      'exec',
      '-T',
      'postgres',
      'psql',
      '-U',
      'postgres',
      '-d',
      '8noai_db',
      '-c',
      'SELECT version();',
    ]);

    let output = '';
    let errorOutput = '';

    psql.stdout.on('data', (data) => {
      output += data.toString();
    });

    psql.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    psql.on('close', (code) => {
      resolve({
        success: code === 0,
        output,
        error: errorOutput,
      });
    });
  });
}

async function main() {
  log('\n🔍 PostgreSQL Connection Test\n', 'blue');

  // Check Docker
  log('1. Checking Docker installation...', 'yellow');
  if (!checkDocker()) {
    log('   ❌ Docker is not installed or not in PATH', 'red');
    log('\n   Please run: pnpm postgres:check', 'yellow');
    log('   This will show installation instructions.\n', 'blue');
    process.exit(1);
  }
  log('   ✅ Docker is installed', 'green');

  // Check if PostgreSQL is running
  log('\n2. Checking PostgreSQL container status...', 'yellow');
  if (!checkPostgresRunning()) {
    log('   ⚠️  PostgreSQL container is not running', 'yellow');
    log('   Attempting to start PostgreSQL...', 'yellow');

    try {
      execSync('docker compose up -d postgres', { stdio: 'inherit' });
      log('   ⏳ Waiting for PostgreSQL to be ready...', 'yellow');

      // Wait a bit for PostgreSQL to start
      await new Promise((resolve) => setTimeout(resolve, 5000));

      if (!checkPostgresRunning()) {
        log('   ❌ Failed to start PostgreSQL', 'red');
        log('   Try running: pnpm postgres:logs', 'yellow');
        process.exit(1);
      }
      log('   ✅ PostgreSQL container started', 'green');
    } catch (error) {
      log('   ❌ Error starting PostgreSQL', 'red');
      log(`   ${error.message}`, 'red');
      process.exit(1);
    }
  } else {
    log('   ✅ PostgreSQL container is running', 'green');
  }

  // Test connection
  log('\n3. Testing database connection...', 'yellow');
  const result = await testConnection();

  if (result.success) {
    log('   ✅ Connection successful!', 'green');
    log('\n📊 PostgreSQL Information:', 'blue');
    console.log(result.output);
    log('\n✅ All tests passed! PostgreSQL is ready to use.\n', 'green');
    log('Connection details:', 'blue');
    log('  Host: localhost', 'blue');
    log('  Port: 5432', 'blue');
    log('  Database: 8noai_db', 'blue');
    log('  Username: postgres', 'blue');
    log('  Password: postgres', 'blue');
    log('\nUseful commands:', 'blue');
    log('  pnpm postgres:shell  - Open PostgreSQL shell', 'blue');
    log('  pnpm postgres:logs   - View PostgreSQL logs', 'blue');
    log('  pnpm postgres:status - Check container status', 'blue');
    log('  pnpm postgres:stop   - Stop PostgreSQL\n', 'blue');
  } else {
    log('   ❌ Connection failed', 'red');
    log(`   Error: ${result.error}`, 'red');
    log('\n   Troubleshooting:', 'yellow');
    log('   1. Check logs: pnpm postgres:logs', 'yellow');
    log('   2. Restart: pnpm postgres:restart', 'yellow');
    log('   3. Check status: pnpm postgres:status\n', 'yellow');
    process.exit(1);
  }
}

main().catch((error) => {
  log(`\n❌ Unexpected error: ${error.message}`, 'red');
  process.exit(1);
});

