const pool = require('./db');
const bcrypt = require('bcrypt');

async function fix() {
    try {
        const hashedPassword = await bcrypt.hash('password123', 10);
        await pool.query('UPDATE Admin SET password = ? WHERE admin_id = 1', [hashedPassword]);
        console.log('Successfully updated Admin password to "password123".');
        
        // Also update customers just in case their seeds are also incorrectly hashed
        await pool.query('UPDATE Customer SET password = ?', [hashedPassword]);
        console.log('Successfully updated all Customer passwords to "password123".');
        
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}

fix();
