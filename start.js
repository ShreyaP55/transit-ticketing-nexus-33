
import { exec, spawn } from 'child_process';
import { existsSync } from 'fs';

// Function to kill process on specific port
const killPort = (port) => {
  const isWindows = process.platform === 'win32';
  const command = isWindows 
    ? `netstat -ano | findstr :${port} && for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`
    : `lsof -ti:${port} | xargs kill -9`;
  
  exec(command, (error, stdout, stderr) => {
    if (!error) {
      console.log(`✅ Cleared port ${port}`);
    }
  });
};

// Clear ports 3000 and 3001 before starting
console.log('🧹 Clearing ports...');
killPort(3000);
killPort(3001);

// Check if server dependencies are installed
const serverNodeModules = './server/node_modules';
if (!existsSync(serverNodeModules)) {
  console.log('📦 Installing server dependencies...');
  const installDeps = exec('cd server && npm install');

  installDeps.stdout.on('data', (data) => {
    console.log(`Dependencies: ${data}`);
  });

  installDeps.on('close', (code) => {
    if (code !== 0) {
      console.error('❌ Failed to install server dependencies');
      process.exit(1);
    }
    startServers();
  });
} else {
  startServers();
}

function startServers() {
  // Wait a moment before starting servers
  setTimeout(() => {
    // Start backend server with proper environment
    console.log('🚀 Starting backend server...');
    const backend = spawn('npm', ['run', 'dev'], {
      cwd: './server',
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development',
        PORT: '3001'
      }
    });

    backend.stdout.on('data', (data) => {
      console.log(`Backend: ${data}`);
    });

    backend.stderr.on('data', (data) => {
      console.error(`Backend Error: ${data}`);
    });

    // Start frontend development server
    console.log('🌐 Starting frontend server...');
    const frontend = spawn('npm', ['run', 'dev'], {
      stdio: 'pipe',
      shell: true,
      env: {
        ...process.env,
        NODE_ENV: 'development'
      }
    });

    frontend.stdout.on('data', (data) => {
      console.log(`Frontend: ${data}`);
    });

    frontend.stderr.on('data', (data) => {
      console.error(`Frontend Error: ${data}`);
    });

    // Handle process termination
    process.on('SIGINT', () => {
      console.log('⏹️ Stopping servers...');
      backend.kill();
      frontend.kill();
      process.exit();
    });
    
    process.on('SIGTERM', () => {
      console.log('⏹️ Stopping servers...');
      backend.kill();
      frontend.kill();
      process.exit();
    });
  }, 2000);
}
