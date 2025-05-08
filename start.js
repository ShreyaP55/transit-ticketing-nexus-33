
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if server directory exists
if (!fs.existsSync(path.join(__dirname, 'server'))) {
  console.error('Error: server directory not found');
  process.exit(1);
}

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
