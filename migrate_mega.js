const pool = require('./db');

async function migrate() {
    try {
        console.log('Starting Mega-Feature Migration...');

        // 1. Transaction Categories
        const [catCol] = await pool.query("SHOW COLUMNS FROM Transaction_Log LIKE 'category'");
        if (catCol.length === 0) {
            await pool.query("ALTER TABLE Transaction_Log ADD category VARCHAR(50) DEFAULT 'General'");
            console.log('Added category to Transaction_Log.');
        }

        // 2. Multi-Currency Support for Accounts
        const [currCol] = await pool.query("SHOW COLUMNS FROM Account LIKE 'currency'");
        if (currCol.length === 0) {
            await pool.query("ALTER TABLE Account ADD currency VARCHAR(10) DEFAULT 'INR'");
            console.log('Added currency to Account.');
        }

        // 3. Beneficiary Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Beneficiaries (
                id INT AUTO_INCREMENT PRIMARY KEY,
                custid INT,
                name VARCHAR(100) NOT NULL,
                account_no_or_upi VARCHAR(100) NOT NULL,
                type ENUM('BANK', 'UPI') NOT NULL,
                created_at DATETIME DEFAULT NOW(),
                FOREIGN KEY (custid) REFERENCES Customer(custid) ON DELETE CASCADE
            )
        `);
        console.log('Ensured Beneficiaries table exists.');

        // 4. Fixed Deposits Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS Fixed_Deposits (
                fd_id INT AUTO_INCREMENT PRIMARY KEY,
                account_no BIGINT,
                amount DECIMAL(12,2) NOT NULL,
                interest_rate DECIMAL(4,2) NOT NULL,
                maturity_date DATETIME NOT NULL,
                created_at DATETIME DEFAULT NOW(),
                status ENUM('ACTIVE', 'MATURED', 'CLOSED') DEFAULT 'ACTIVE',
                FOREIGN KEY (account_no) REFERENCES Account(account_no) ON DELETE CASCADE
            )
        `);
        console.log('Ensured Fixed_Deposits table exists.');

        // 5. Seed some categories for existing transactions
        await pool.query("UPDATE Transaction_Log SET category = 'Income' WHERE txn_type = 'CREDIT'");
        await pool.query("UPDATE Transaction_Log SET category = 'Shopping' WHERE txn_type = 'DEBIT' AND description LIKE '%Purchase%'");
        await pool.query("UPDATE Transaction_Log SET category = 'Transfer' WHERE txn_type = 'TRANSFER'");
        await pool.query("UPDATE Transaction_Log SET category = 'Bills' WHERE description LIKE '%Electricity%' OR description LIKE '%Water%'");
        
        console.log('Migration Complete.');
        process.exit(0);
    } catch (e) {
        console.error('Migration Failed:', e);
        process.exit(1);
    }
}

migrate();
