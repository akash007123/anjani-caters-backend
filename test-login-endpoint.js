const http = require('http');
const dotenv = require('dotenv');

dotenv.config();

function testLoginEndpoint() {
    console.log('Testing login endpoint...');
    
    const testCredentials = [
        { email: 'admin@test.com', password: '123456' },
        { email: 'admin@anjanicaters.com', password: 'admin123' },
        { email: 'akashraikwar763@gmail.com', password: 'admin123' }
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
        
        // Wait 500ms between requests
        setTimeout(() => {}, 500);
    });
}

// Give server time to start
setTimeout(testLoginEndpoint, 2000);