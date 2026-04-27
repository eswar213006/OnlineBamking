const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
    try {
        const { username, password } = req.body;
        const [admins] = await pool.query('SELECT * FROM Admin WHERE username = ?', [username]);
        
        if (admins.length === 0) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const admin = admins[0];
        const isMatch = await bcrypt.compare(password, admin.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        
        const token = jwt.sign({ id: admin.admin_id, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token, user: { id: admin.admin_id, username: admin.username, role: 'admin' } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllCustomers = async (req, res) => {
    try {
        const [customers] = await pool.query('SELECT custid, name, email, phone, address FROM Customer');
        res.json(customers);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAccounts = async (req, res) => {
    try {
        const [accounts] = await pool.query(`
            SELECT a.account_no, a.acc_type, a.balance, b.name as branch_name, hb.custid, c.name as customer_name
            FROM Account a
            LEFT JOIN Branch b ON a.branch_id = b.branch_id
            LEFT JOIN Hold_By hb ON a.account_no = hb.account_no
            LEFT JOIN Customer c ON hb.custid = c.custid
        `);
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllTransactions = async (req, res) => {
    try {
        const [logs] = await pool.query('SELECT * FROM Transaction_Log ORDER BY txn_date DESC LIMIT 100');
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteCustomer = async (req, res) => {
    try {
        await pool.query('DELETE FROM Customer WHERE custid = ?', [req.params.id]);
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
