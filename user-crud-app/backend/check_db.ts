import pool from './src/config/db';

async function check() {
    try {
        const [rows] = await pool.query('DESCRIBE common_expense_payments');
        console.log(JSON.stringify(rows, null, 2));
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
