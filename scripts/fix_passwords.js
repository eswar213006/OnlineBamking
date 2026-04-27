const mysql = require('mysql2/promise');
const hash = '$2a$10$mhDEy0WbipV5XHaH6EoDBe/NYXY/hlGGNuQ4wgfz3z9U7TofULzsO';

async function run() {
    const conn = await mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'eswar213006',
        database: 'online_banking'
    });
    await conn.query('UPDATE Customer SET password = ?', [hash]);
    await conn.query('UPDATE Admin SET password = ?', [hash]);
    console.log('Passwords updated successfully to password123');
    process.exit(0);
}
run();
