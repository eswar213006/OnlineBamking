const mysql = require('mysql2/promise');
require('dotenv').config();

async function compat() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'eswar213006',
        database: 'bank'
    });

    async function addColumn(table, column, definition) {
        try {
            console.log(`Checking column ${column} in ${table}...`);
            const [cols] = await conn.query('SHOW COLUMNS FROM ?? LIKE ?', [table, column]);
            if (cols.length === 0) {
                console.log(`Adding column ${column}...`);
                await conn.query(`ALTER TABLE ?? ADD COLUMN ?? ${definition}`, [table, column]);
            }
        } catch (e) { console.log(`Error adding ${column} to ${table}:`, e.message); }
    }

    await addColumn('Customer', 'email', 'VARCHAR(100) UNIQUE');
    await addColumn('Customer', 'password', 'VARCHAR(255)');
    await addColumn('Account', 'upi_id', 'VARCHAR(100) UNIQUE');
    await addColumn('Availed_By', 'balance', 'DECIMAL(12,2)');

    try {
        const [users] = await conn.query('SELECT * FROM Customer WHERE email = "ravi@example.com"');
        if (users.length === 0) {
            console.log('Updating user 1 with credentials...');
            const bcrypt = require('bcryptjs');
            const hash = await bcrypt.hash('password123', 10);
            await conn.query('UPDATE Customer SET email = ?, password = ? WHERE custid = 1', ['ravi@example.com', hash]);
        }
    } catch (e) { console.log('User update error:', e.message); }

    try {
        console.log('Creating Transaction_Log...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS Transaction_Log (
                txn_id INT AUTO_INCREMENT PRIMARY KEY,
                account_no BIGINT,
                txn_type ENUM('CREDIT', 'DEBIT', 'TRANSFER', 'UPI') NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                txn_date DATETIME DEFAULT NOW(),
                description VARCHAR(255),
                category VARCHAR(100) DEFAULT 'General',
                FOREIGN KEY (account_no) REFERENCES Account(account_no) ON DELETE SET NULL
            )
        `);
    } catch (e) { console.log('Transaction_Log error:', e.message); }

    try {
        console.log('Creating Admin...');
        await conn.query(`
            CREATE TABLE IF NOT EXISTS Admin (
                admin_id INT PRIMARY KEY AUTO_INCREMENT,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            )
        `);
    } catch (e) { console.log('Admin error:', e.message); }

    try {
        console.log('Syncing Availed_By balances...');
        await conn.query('UPDATE Availed_By ab JOIN Loan l ON ab.loan_id = l.loan_id SET ab.balance = l.amount WHERE ab.balance IS NULL');
    } catch (e) { console.log('Sync error:', e.message); }

    console.log('Bank database is now compatible with PayProtect!');
    process.exit(0);
}

compat();
