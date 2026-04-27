const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
require('dotenv').config();

async function fix() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'eswar213006',
        database: 'bank'
    });

    try {
        console.log('Fixing credentials for all users...');
        const [users] = await conn.query('SELECT custid, name FROM Customer');
        
        const hash = await bcrypt.hash('password123', 10);

        for (const user of users) {
            // Generate email from name: "Ravi Kumar" -> "ravi@example.com"
            const email = user.name.split(' ')[0].toLowerCase() + '@example.com';
            console.log(`Setting credentials for ${user.name}: ${email} / password123`);
            
            await conn.query(
                'UPDATE Customer SET email = ?, password = ? WHERE custid = ?',
                [email, hash, user.custid]
            );
        }
        
        // Also ensure admin exists
        const adminHash = await bcrypt.hash('admin123', 10);
        await conn.query('INSERT IGNORE INTO Admin (username, password) VALUES (?, ?)', ['admin', adminHash]);
        console.log('Admin account: admin / admin123');

        console.log('All user credentials synchronized!');
    } catch (e) {
        console.log('Error:', e.message);
    }
    process.exit(0);
}

fix();
