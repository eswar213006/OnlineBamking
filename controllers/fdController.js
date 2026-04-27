const pool = require('../db');

exports.createFD = async (req, res) => {
    try {
        const { account_no, amount, duration_months } = req.body;
        const interest_rate = 7.5; // Fixed rate for now
        const maturity_date = new Date();
        maturity_date.setMonth(maturity_date.getMonth() + duration_months);

        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            // Deduct from account
            const [rows] = await connection.query('SELECT balance FROM Account WHERE account_no = ?', [account_no]);
            if (rows.length === 0) throw new Error('Account not found');
            if (Number(rows[0].balance) < Number(amount)) throw new Error('Insufficient balance to open FD');

            await connection.query('UPDATE Account SET balance = balance - ? WHERE account_no = ?', [amount, account_no]);
            await connection.query('INSERT INTO Transaction_Log (account_no, txn_type, amount, description, category) VALUES (?, ?, ?, ?, ?)', 
                [account_no, 'DEBIT', amount, `FD Opening - ${duration_months}mo`, 'Investment']);

            await connection.query(
                'INSERT INTO Fixed_Deposits (account_no, amount, interest_rate, maturity_date) VALUES (?, ?, ?, ?)',
                [account_no, amount, interest_rate, maturity_date]
            );

            await connection.commit();
            res.status(201).json({ message: 'Fixed Deposit created successfully' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getFDs = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT fd.* FROM Fixed_Deposits fd 
            JOIN Hold_By hb ON fd.account_no = hb.account_no 
            WHERE hb.custid = ?`, [req.params.custid]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
