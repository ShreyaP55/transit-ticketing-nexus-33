
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting BusInn Backend Server...');

// Check if node_modules exists
import { existsSync } from 'fs';
const nodeModulesPath = join(__dirname, 'node_modules');

if (!existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  const installProcess = spawn('npm', ['install'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true
  });

  installProcess.on('close', (code) => {
    if (code === 0) {
      startServer();
    } else {
      console.error('❌ Failed to install dependencies');
      process.exit(1);
    }
  });
} else {
  startServer();
}

function startServer() {
  console.log('🔧 Starting server with nodemon...');
  
  const serverProcess = spawn('npm', ['run', 'dev'], {
    cwd: __dirname,
    stdio: 'inherit',
    shell: true,
    env: {
      ...process.env,
      NODE_ENV: 'development'
    }
  });

  serverProcess.on('error', (error) => {
    console.error('❌ Failed to start server:', error);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
  });

  // Handle graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n⏹️ Shutting down server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
  });
}
