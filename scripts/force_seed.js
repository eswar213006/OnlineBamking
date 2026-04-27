const mysql = require('mysql2/promise');
require('dotenv').config();

async function seed() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'eswar213006',
        database: 'bank',
        multipleStatements: true
    });

    try {
        console.log('Force seeding user data...');
        await conn.query('SET FOREIGN_KEY_CHECKS = 0');
        
        // 1. Clear tables
        await conn.query('TRUNCATE TABLE Hold_By');
        await conn.query('TRUNCATE TABLE Availed_By');
        await conn.query('TRUNCATE TABLE Account');
        await conn.query('TRUNCATE TABLE Loan');
        await conn.query('TRUNCATE TABLE Customer');

        // 2. Insert Customers
        await conn.query(`
            INSERT INTO Customer (custid, name, phone, address) VALUES
            (1, 'Ravi Kumar', '9876543210', 'Hyderabad'),
            (2, 'Sita Devi', '9123456780', 'Hyderabad'),
            (3, 'Arjun Rao', '9012345678', 'Bangalore')
        `);

        // 3. Insert Accounts
        await conn.query(`
            INSERT INTO Account (account_no, acc_type, balance, branch_id) VALUES
            (100001, 'Savings', 50000.00, 101),
            (100002, 'Savings', 75000.00, 103),
            (100003, 'Current', 120000.00, 102)
        `);

        // 4. Insert Hold_By
        await conn.query(`
            INSERT INTO Hold_By (custid, account_no) VALUES
            (1, 100001),
            (2, 100001),
            (1, 100002),
            (3, 100003)
        `);

        // 5. Insert Loans
        await conn.query(`
            INSERT INTO Loan (loan_id, loan_type, amount, branch_id) VALUES
            (201, 'Home Loan', 2500000.00, 101),
            (202, 'Education Loan', 800000.00, 102)
        `);

        // 6. Insert Availed_By
        await conn.query(`
            INSERT INTO Availed_By (custid, loan_id, balance) VALUES
            (1, 201, 2500000.00),
            (2, 201, 2500000.00),
            (3, 202, 800000.00)
        `);

        await conn.query('SET FOREIGN_KEY_CHECKS = 1');
        console.log('Force seed successful!');
    } catch (e) {
        console.log('Error:', e.message);
    }
    process.exit(0);
}

seed();
