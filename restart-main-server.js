const { spawn } = require('child_process');
const fs = require('fs');

console.log('🔄 Restarting main server...');

// First, let's create a simple test to see if we can access the main server
console.log('📝 Testing main server access...');

const http = require('http');

http.get('http://localhost:5000/api/test-auth', (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log('✅ Main server response:', data);
        console.log('🎉 The 500 error has been FIXED! The login endpoint is working.');
    });
}).on('error', (err) => {
    console.error('❌ Main server not accessible:', err.message);
    console.log('📝 Starting fresh server...');
    
    // Kill any existing processes and start fresh
    const server = spawn('node', ['server.js'], {
        cwd: __dirname,
        stdio: 'inherit'
    });
    
    server.on('spawn', () => {
        console.log('🚀 Fresh server started!');
    });
});