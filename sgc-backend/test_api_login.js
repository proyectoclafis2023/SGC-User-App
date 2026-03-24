const http = require('http');

const users = [
    { email: 'admin@sgc.cl' },
    { email: 'residente@sgc.cl' },
    { email: 'propietario@sgc.cl' },
    { email: 'conserje@sgc.cl' }
];

async function postLogin(email) {
    return new Promise((resolve, reject) => {
        const data = JSON.stringify({ username: email, password: 'sgc123' });
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length
            }
        };

        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                const json = JSON.parse(body);
                if (res.statusCode >= 400) reject({ response: { data: json }, statusCode: res.statusCode });
                else resolve(json);
            });
        });

        req.on('error', (e) => reject(e));
        req.write(data);
        req.end();
    });
}

async function test() {
    for (const u of users) {
        try {
            const data = await postLogin(u.email);
            console.log(`\n--- Login Success: ${u.email} ---`);
            console.log(`Role: ${data.user.role}`);
            console.log(`Permissions: ${data.user.permissions.join(', ')}`);
        } catch (err) {
            console.error(`\n--- Login Failed: ${u.email} ---`);
            console.error(err.response?.data || err.message);
        }
    }
}

test();
