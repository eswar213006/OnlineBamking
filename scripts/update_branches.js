const mysql = require('mysql2/promise');
require('dotenv').config();

async function update() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'eswar213006',
        database: 'bank'
    });

    try {
        console.log('Cleaning up existing branches...');
        // First disable foreign key checks to avoid errors if branches are in use
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        await conn.query('DELETE FROM Branch');
        
        console.log('Inserting requested branches...');
        const branches = [
            [101, 'T NAGAR BRANCH', 'Chennai, Tamil Nadu'],
            [102, 'POTHERI BRANCH', 'Chennai, Tamil Nadu'],
            [103, 'CHENGALPATTU BRANCH', 'Chennai, Tamil Nadu'],
            [104, 'ANNA NAGAR BRANCH', 'Chennai, Tamil Nadu'],
            [105, 'TIRUSULAM BRANCH', 'Chennai, Tamil Nadu']
        ];
        
        for (const [id, name, addr] of branches) {
            await conn.query('INSERT INTO Branch (branch_id, name, address) VALUES (?, ?, ?)', [id, name, addr]);
        }
        
        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Branches synchronized successfully!');
    } catch (e) {
        console.log('Error:', e.message);
    }
    process.exit(0);
}

update();
