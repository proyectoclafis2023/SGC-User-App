const fs = require('fs');
const path = require('path');

const API_BASE = 'http://localhost:3001/api';
const LOG_FILE = path.join(__dirname, '../../logs/rbac-test.log');

// Configuration
const users = [
    { email: 'gdcuentas@sgc.cl', password: 'admin123', role: 'admin' },
    { email: 'residente@sgc.cl', password: 'sgc123', role: 'resident' },
    { email: 'conserje@sgc.cl', password: 'sgc123', role: 'concierge' },
    { email: 'propietario@sgc.cl', password: 'sgc123', role: 'owner' }
];

const delay = () => new Promise(res => setTimeout(res, Math.floor(Math.random() * (1200 - 800 + 1) + 800)));

function logEvent(role, action, result) {
    const timestamp = new Date().toISOString();
    const entry = `[${timestamp}] [${role}] ${action} ${result}\n`;
    fs.appendFileSync(LOG_FILE, entry);
    console.log(entry.trim());
}

async function fetchWithRetry(url, options, role) {
    try {
        let response = await fetch(url, options);
        
        if (response.status === 429) {
            logEvent(role, 'RATE_LIMIT_HIT', 'WAITING 30S');
            await new Promise(res => setTimeout(res, 30000));
            response = await fetch(url, options);
        }
        
        return response;
    } catch (error) {
        logEvent(role, 'FETCH_ERROR', error.message);
        return { ok: false, status: 500, json: async () => ({ error: error.message }) };
    }
}

async function runTests() {
    console.log('🚀 --- SGC RBAC AUTOMATED TEST RUNNER START ---');
    
    for (const user of users) {
        try {
            await delay();
            
            // 1. LOGIN
            const loginRes = await fetchWithRetry(`${API_BASE}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: user.email, password: user.password })
            }, user.role);

            if (!loginRes.ok) {
                logEvent(user.role, 'LOGIN', `FAILED (${loginRes.status})`);
                continue;
            }

            const loginData = await loginRes.json();
            const token = loginData.token;
            logEvent(user.role, 'LOGIN', 'OK');

            const headers = {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            };

            await delay();

            // 2. ROLE SPECIFIC ACTIONS
            if (user.role === 'admin') {
                // Create payment (Operation finance) - Mapping to common_expense_payments
                const res = await fetchWithRetry(`${API_BASE}/common_expense_payments`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                        department_id: 'any',
                        amount_paid: 1000,
                        payment_date: new Date().toISOString(),
                        payment_method: 'Transferencia',
                        status: 'confirmed',
                        period_month: 3,
                        period_year: 2026
                    })
                }, user.role);
                logEvent(user.role, 'CREATE_PAYMENT', res.ok ? 'OK' : `FAILED (${res.status})`);

            } else if (user.role === 'resident') {
                // View payments
                const res = await fetchWithRetry(`${API_BASE}/common_expense_payments`, { headers }, user.role);
                logEvent(user.role, 'VIEW_PAYMENTS', res.ok ? 'OK' : `FAILED (${res.status})`);
                
                await delay();
                
                // Restricted access (attempt personal endpoint - Standard says it should be restricted)
                const restricted = await fetchWithRetry(`${API_BASE}/personal`, { headers }, user.role);
                // 403 or 401 is expected. If it's NOT (200, 404, etc), we check.
                // NOTE: If endpoint exists but is NOT guarded, it returns 200 (DANGER).
                // If endpoint doesn't exist, it returns 404.
                if (restricted.status === 403 || restricted.status === 401) {
                    logEvent(user.role, 'ACCESS_RESTRICTED_PERSONAL', 'ACCESS DENIED (EXPECTED)');
                } else if (restricted.status === 200) {
                    logEvent(user.role, 'ACCESS_RESTRICTED_PERSONAL', 'ACCESS GRANTED (DANGER)');
                } else {
                    logEvent(user.role, 'ACCESS_RESTRICTED_PERSONAL', `FAILED (${restricted.status})`);
                }

            } else if (user.role === 'concierge') {
                // Register visit
                const res = await fetchWithRetry(`${API_BASE}/visitas`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({
                       folio: 'TEST' + Date.now(),
                       names: 'Test Visitor',
                       dni: '1-1',
                       visit_date: new Date().toISOString().split('T')[0],
                       visit_time: 'Mañana',
                       status: 'scheduled'
                    })
                }, user.role);
                logEvent(user.role, 'REGISTER_VISIT', res.ok ? 'OK' : `FAILED (${res.status})`);

            } else if (user.role === 'owner') {
                // View unit
                const res = await fetchWithRetry(`${API_BASE}/torres`, { headers }, user.role);
                logEvent(user.role, 'VIEW_TOWERS', res.ok ? 'OK' : `FAILED (${res.status})`);
            }

        } catch (e) {
            logEvent(user.role, 'UNEXPECTED_ERROR', e.message);
        }
    }
    
    console.log('🏁 --- SGC RBAC AUTOMATED TEST RUNNER FINISHED ---');
}

runTests().catch(err => {
    console.error('CRITICAL FAILURE:', err);
    process.exit(1);
});
