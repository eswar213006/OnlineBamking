const pool = require('../db');

exports.getCustomerProfile = async (req, res) => {
    try {
        const [customers] = await pool.query('SELECT custid, name, phone, address, email FROM Customer WHERE custid = ?', [req.params.id]);
        if (customers.length === 0) return res.status(404).json({ message: 'Customer not found' });
        res.json(customers[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { name, phone, address } = req.body;
        await pool.query('UPDATE Customer SET name = ?, phone = ?, address = ? WHERE custid = ?', [name, phone, address, req.params.id]);
        res.json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
