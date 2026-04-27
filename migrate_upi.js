const pool = require('./db');

async function migrate() {
    try {
        console.log('Starting UPI Migration...');
        
        // 1. Check if column exists
        const [columns] = await pool.query("SHOW COLUMNS FROM Account LIKE 'upi_id'");
        
        if (columns.length === 0) {
            await pool.query('ALTER TABLE Account ADD upi_id VARCHAR(50) UNIQUE');
            console.log('Added upi_id column to Account table.');
        } else {
            console.log('upi_id column already exists.');
        }

        // 2. Populate existing accounts with default UPI IDs (account_no@paytona)
        const [accounts] = await pool.query('SELECT account_no FROM Account WHERE upi_id IS NULL');
        for (const acc of accounts) {
            const upiId = `${acc.account_no}@paytona`;
            await pool.query('UPDATE Account SET upi_id = ? WHERE account_no = ?', [upiId, acc.account_no]);
        }
        console.log(`Initialized UPI IDs for ${accounts.length} existing accounts.`);

        // 3. Update Transaction_Log txn_type enum to include 'UPI'
        try {
            await pool.query("ALTER TABLE Transaction_Log MODIFY COLUMN txn_type ENUM('CREDIT', 'DEBIT', 'TRANSFER', 'UPI') NOT NULL");
            console.log('Updated Transaction_Log enum to include UPI.');
        } catch (e) {
            console.log('Note: Enum update failed. Using TRANSFER for UPI transactions.');
        }

        console.log('Migration Complete.');
        process.exit(0);
    } catch (e) {
        console.error('Migration Failed:', e);
        process.exit(1);
    }
}

migrate();
