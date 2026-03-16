import pool from './src/config/db';

const entities = [
    'towers', 'departments', 'residents', 'owners', 'personnel', 'common_expense_payments'
];

async function check() {
    try {
        for (const table of entities) {
            const [rows]: any = await pool.query(`SELECT COUNT(*) as count FROM ${table}`);
            console.log(`${table}: ${rows[0].count}`);
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
check();
