const pool = require('../db');

const pendingTransfers = new Map();

exports.deposit = async (req, res) => {
    try {
        const { account_no, amount, description } = req.body;
        
        // Transaction is less complex here, but good practice
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            await connection.query('UPDATE Account SET balance = balance + ? WHERE account_no = ?', [amount, account_no]);
            await connection.query('INSERT INTO Transaction_Log (account_no, txn_type, amount, description) VALUES (?, ?, ?, ?)', 
                [account_no, 'CREDIT', amount, description || 'Deposit']);
            
            await connection.commit();
            res.json({ message: 'Deposit successful' });
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.withdraw = async (req, res) => {
    try {
        const { account_no, amount, description } = req.body;
        
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            // Check balance
            const [rows] = await connection.query('SELECT balance FROM Account WHERE account_no = ?', [account_no]);
            if (rows.length === 0) throw new Error('Account not found');
            if (Number(rows[0].balance) < Number(amount)) throw new Error('Insufficient balance');
            
            // The trigger check_negative_balance checks the database balance *prior* to this update.
            // By inserting the log first, we ensure the trigger reads the un-deducted balance.
            await connection.query('INSERT INTO Transaction_Log (account_no, txn_type, amount, description) VALUES (?, ?, ?, ?)', 
                [account_no, 'DEBIT', amount, description || 'Withdrawal']);
            await connection.query('UPDATE Account SET balance = balance - ? WHERE account_no = ?', [amount, account_no]);
            
            await connection.commit();
            res.json({ message: 'Withdrawal successful' });
        } catch (err) {
            await connection.rollback();
            res.status(400).json({ error: err.message });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.initiateTransfer = async (req, res) => {
    try {
        const { from_account, to_account, amount, description } = req.body;
        
        // Basic validations
        if (from_account == to_account) throw new Error("Cannot transfer to the same account");
        
        // Initial balance check
        const [rows] = await pool.query('SELECT balance FROM Account WHERE account_no = ?', [from_account]);
        if (rows.length === 0) throw new Error('Account not found');
        if (Number(rows[0].balance) < Number(amount)) throw new Error('Insufficient balance for transfer!');

        // Generate OTP and store locally
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const txn_id = Date.now().toString() + Math.floor(Math.random()*1000);
        
        pendingTransfers.set(txn_id, {
            from_account,
            to_account,
            amount,
            description,
            otp,
            type: 'TRANSFER',
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        res.json({ message: 'OTP Generated successfully.', txn_id, demo_otp: otp });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.initiateUPITransfer = async (req, res) => {
    try {
        const { from_account, upi_id, amount, description } = req.body;
        
        // Resolve UPI ID to Account No
        const [upiRows] = await pool.query('SELECT account_no FROM Account WHERE upi_id = ?', [upi_id]);
        if (upiRows.length === 0) throw new Error('Recipient UPI ID not found');
        
        const to_account = upiRows[0].account_no;
        if (from_account == to_account) throw new Error("Cannot transfer to your own account via UPI");

        // Initial balance check
        const [rows] = await pool.query('SELECT balance FROM Account WHERE account_no = ?', [from_account]);
        if (rows.length === 0) throw new Error('Account not found');
        if (Number(rows[0].balance) < Number(amount)) throw new Error('Insufficient balance for UPI payment!');

        // Generate OTP and store locally
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const txn_id = 'UPI' + Date.now().toString() + Math.floor(Math.random()*1000);
        
        pendingTransfers.set(txn_id, {
            from_account,
            to_account,
            upi_id,
            amount,
            description: description || 'UPI Payment to ' + upi_id,
            otp,
            type: 'UPI',
            expiresAt: Date.now() + 5 * 60 * 1000 // 5 minutes
        });

        res.json({ message: 'UPI Auth PIN Generated.', txn_id, demo_otp: otp });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.verifyTransfer = async (req, res) => {
    try {
        const { txn_id, otp } = req.body;
        
        const pending = pendingTransfers.get(txn_id);
        if (!pending) return res.status(400).json({ error: 'Transaction expired or invalid' });
        if (pending.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
        if (Date.now() > pending.expiresAt) return res.status(400).json({ error: 'OTP has expired' });
        
        // OTP valid, proceed with actual transfer
        const { from_account, to_account, amount, description, type } = pending;
        const txnType = type === 'UPI' ? 'UPI' : 'TRANSFER';
        
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        try {
            // First log the transfer so the trigger `check_negative_balance` evaluates the sender's current balance
            await connection.query('INSERT INTO Transaction_Log (account_no, txn_type, amount, description) VALUES (?, ?, ?, ?)', 
                [from_account, txnType, amount, description || (txnType + ' to ' + (pending.upi_id || to_account))]);
            
            // Then deduct from sender
            await connection.query('UPDATE Account SET balance = balance - ? WHERE account_no = ?', [amount, from_account]);
            
            // Set savepoint
            await connection.query('SAVEPOINT before_receive');
            
            // Add to receiver
            const [updateRes] = await connection.query('UPDATE Account SET balance = balance + ? WHERE account_no = ?', [amount, to_account]);
            if (updateRes.affectedRows === 0) {
                // receiver account not found
                await connection.query('ROLLBACK TO SAVEPOINT before_receive');
                throw new Error('Receiver account not found');
            }
            
            await connection.query('INSERT INTO Transaction_Log (account_no, txn_type, amount, description) VALUES (?, ?, ?, ?)', 
                [to_account, 'CREDIT', amount, description || (txnType + ' from ' + from_account)]);

            await connection.commit();
            pendingTransfers.delete(txn_id); // Clean up
            res.json({ message: txnType + ' successful' });
        } catch (err) {
            await connection.rollback();
            res.status(400).json({ error: err.message });
        } finally {
            connection.release();
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateUPIHandle = async (req, res) => {
    try {
        const { account_no, new_upi_handle } = req.body;
        const fullUpiId = new_upi_handle + '@paytona';
        
        // Check if taken
        const [existing] = await pool.query('SELECT account_no FROM Account WHERE upi_id = ?', [fullUpiId]);
        if (existing.length > 0) throw new Error('UPI Handle already taken');
        
        await pool.query('UPDATE Account SET upi_id = ? WHERE account_no = ?', [fullUpiId, account_no]);
        res.json({ message: 'UPI Handle updated successfully', upi_id: fullUpiId });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    try {
        const { custid } = req.params;
        const [rows] = await pool.query(`
            SELECT category, SUM(amount) as total 
            FROM Transaction_Log tl
            JOIN Hold_By hb ON tl.account_no = hb.account_no
            WHERE hb.custid = ? AND tl.txn_type IN ('DEBIT', 'TRANSFER', 'UPI')
            GROUP BY category`, [custid]);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHistory = async (req, res) => {
    try {
        const [logs] = await pool.query('SELECT * FROM Transaction_Log WHERE account_no = ? ORDER BY txn_date DESC', [req.params.account_no]);
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
