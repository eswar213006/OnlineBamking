const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'eswar213006',
        database: 'bank'
    });

    try {
        console.log('Seeding transaction history...');
        const txns = [
            [100001, 'CREDIT', 50000, 'Initial Portfolio Liquidity', 'Inbound'],
            [100001, 'DEBIT', 1200, 'Strategic Node Maintenance', 'Maintenance'],
            [100002, 'CREDIT', 75000, 'Capital Migration', 'Inbound'],
            [100003, 'CREDIT', 120000, 'Enterprise Liquidity Injection', 'Business']
        ];

        for (const [acc, type, amt, desc, cat] of txns) {
            await conn.query(
                'INSERT INTO Transaction_Log (account_no, txn_type, amount, description, category) VALUES (?, ?, ?, ?, ?)',
                [acc, type, amt, desc, cat]
            );
        }
        console.log('Transaction history seeded!');
    } catch (e) {
        console.log('Error:', e.message);
    }
    process.exit(0);
}

seed();
