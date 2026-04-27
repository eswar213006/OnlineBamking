const pool = require('../db');

exports.addBeneficiary = async (req, res) => {
    try {
        const { custid, name, account_no_or_upi, type } = req.body;
        await pool.query(
            'INSERT INTO Beneficiaries (custid, name, account_no_or_upi, type) VALUES (?, ?, ?, ?)',
            [custid, name, account_no_or_upi, type]
        );
        res.status(201).json({ message: 'Beneficiary added' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBeneficiaries = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Beneficiaries WHERE custid = ?', [req.params.custid]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBeneficiary = async (req, res) => {
    try {
        await pool.query('DELETE FROM Beneficiaries WHERE id = ?', [req.params.id]);
        res.json({ message: 'Beneficiary removed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
