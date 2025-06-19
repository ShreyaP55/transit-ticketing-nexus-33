
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if server directory exists
if (!fs.existsSync(path.join(__dirname, 'server'))) {
  console.error('Error: server directory not found');
  process.exit(1);
}

// Function to kill process on specific port
const killPort = (port) => {
  const isWindows = process.platform === 'win32';
  const command = isWindows 
    ? `netstat -ano | findstr :${port} && for /f "tokens=5" %a in ('netstat -ano ^| findstr :${port}') do taskkill /f /pid %a`
    : `lsof -ti:${port} | xargs kill -9`;
  
  exec(command, (error, stdout, stderr) => {
    if (!error) {
      console.log(`Cleared port ${port}`);
    }
  });
};

// Clear ports 3000 and 3001 before starting
console.log('Clearing ports...');
killPort(3000);
killPort(3001);

// Wait a moment before starting servers
setTimeout(() => {
  // Start backend server
  console.log('Starting backend server...');
  const backend = exec('cd server && npm run dev');

  backend.stdout.on('data', (data) => {
    console.log(`Backend: ${data}`);
  });

  backend.stderr.on('data', (data) => {
    console.error(`Backend Error: ${data}`);
  });

  // Start frontend development server
  console.log('Starting frontend server...');
  const frontend = exec('npm run dev');

  frontend.stdout.on('data', (data) => {
    console.log(`Frontend: ${data}`);
  });

  frontend.stderr.on('data', (data) => {
    console.error(`Frontend Error: ${data}`);
  });

  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Stopping servers...');
    backend.kill();
    frontend.kill();
    process.exit();
  });
}, 2000);
