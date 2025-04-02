const { spawn } = require('child_process');
const path = require('path');

// सर्वर प्रोसेस स्टार्ट करें
const serverProcess = spawn('node', ['server.js'], {
  stdio: 'inherit',
  shell: true
});

console.log('Server process started with PID:', serverProcess.pid);

// प्रोसेस एग्जिट हैंडलर
process.on('exit', () => {
  console.log('Killing server process...');
  serverProcess.kill();
});

// अनहैंडल्ड एक्सेप्शन हैंडलर
process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
  serverProcess.kill();
  process.exit(1);
}); 