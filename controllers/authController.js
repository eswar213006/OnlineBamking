const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    try {
        const { name, phone, address, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const [result] = await pool.query(
            'INSERT INTO Customer (name, phone, address, email, password) VALUES (?, ?, ?, ?, ?)',
            [name, phone, address, email, hashedPassword]
        );
        res.status(201).json({ message: 'Customer registered successfully', custid: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'Email or phone already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const [customers] = await pool.query('SELECT * FROM Customer WHERE email = ?', [email]);
        
        if (customers.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const customer = customers[0];
        const isMatch = await bcrypt.compare(password, customer.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        
        const token = jwt.sign({ id: customer.custid, role: 'customer' }, process.env.JWT_SECRET, { expiresIn: '1h' });
        
        res.json({ token, user: { id: customer.custid, name: customer.name, email: customer.email, role: 'customer' } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
