const http = require('http');

function testMainServer() {
    console.log('Testing main server login endpoint...');
    
    const testCredentials = [
        { email: 'admin@test.com', password: '123456' },
        { email: 'admin@anjanicaters.com', password: 'admin123' }
    ];
    
    testCredentials.forEach((creds, index) => {
        console.log(`\n--- Test ${index + 1}: ${creds.email} ---`);
        
        const postData = JSON.stringify(creds);
        
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };
        
        const req = http.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                console.log(`Status: ${res.statusCode}`);
                console.log(`Response: ${data}`);
                try {
                    const parsed = JSON.parse(data);
                    if (parsed.success) {
                        console.log('✅ Login successful!');
                        console.log('🎉 THE 500 ERROR HAS BEEN FIXED!');
                    } else {
                        console.log('❌ Login failed:', parsed.message);
                    }
                } catch (e) {
                    console.log('❌ Could not parse JSON response');
                }
            });
        });
        
        req.on('error', (e) => {
            console.error(`❌ Request failed: ${e.message}`);
        });
        
        req.write(postData);
        req.end();
    });
}

// Give the main server time to start
setTimeout(testMainServer, 2000);