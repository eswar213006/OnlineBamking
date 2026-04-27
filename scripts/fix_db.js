const mysql = require('mysql2/promise');
require('dotenv').config();

async function fix() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'eswar213006',
        database: process.env.DB_NAME || 'online_banking'
    });

    try {
        console.log('Adding category column...');
        await conn.query('ALTER TABLE Transaction_Log ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT "General"');
    } catch (e) {
        console.log('Category column might already exist');
    }

    try {
        console.log('Updating txn_type ENUM...');
        await conn.query("ALTER TABLE Transaction_Log MODIFY COLUMN txn_type ENUM('CREDIT', 'DEBIT', 'TRANSFER', 'UPI') NOT NULL");
    } catch (e) {
        console.log('Failed to update ENUM:', e.message);
    }

    console.log('Done');
    process.exit(0);
}

fix();
