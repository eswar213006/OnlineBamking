const pool = require('../db');

exports.getAccounts = async (req, res) => {
    try {
        const [accounts] = await pool.query(`
            SELECT a.account_no, a.acc_type, a.balance, a.upi_id, b.name as branch_name 
            FROM Account a 
            JOIN Hold_By hb ON a.account_no = hb.account_no 
            LEFT JOIN Branch b ON a.branch_id = b.branch_id 
            WHERE hb.custid = ?`, 
            [req.params.custid]);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBalance = async (req, res) => {
    try {
        const [accounts] = await pool.query('SELECT balance FROM Account WHERE account_no = ?', [req.params.account_no]);
        if (accounts.length === 0) return res.status(404).json({ message: 'Account not found' });
        res.json({ balance: accounts[0].balance });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createAccount = async (req, res) => {
    try {
        const { custid, acc_type, branch_id, initial_deposit } = req.body;
        const account_no = Math.floor(Math.random() * 900000) + 100000; // Generate 6 digit account no
        const upi_id = `${account_no}@paytona`;
        
        await pool.query(
            'INSERT INTO Account (account_no, acc_type, balance, branch_id, upi_id) VALUES (?, ?, ?, ?, ?)',
            [account_no, acc_type, initial_deposit || 0, branch_id, upi_id]
        );
        
        await pool.query(
            'INSERT INTO Hold_By (custid, account_no) VALUES (?, ?)',
            [custid, account_no]
        );
        
        res.status(201).json({ message: 'Account created successfully', account_no });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBranches = async (req, res) => {
    try {
        const [branches] = await pool.query('SELECT branch_id, name, address FROM Branch');
        res.json(branches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

