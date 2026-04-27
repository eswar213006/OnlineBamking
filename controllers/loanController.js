const pool = require('../db');

exports.getAllLoans = async (req, res) => {
    try {
        const [loans] = await pool.query('SELECT * FROM Loan');
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.applyLoan = async (req, res) => {
    try {
        const { custid, loan_id } = req.body;
        const [loans] = await pool.query('SELECT amount FROM Loan WHERE loan_id = ?', [loan_id]);
        if (loans.length === 0) return res.status(404).json({ message: 'Loan template not found' });
        
        await pool.query('INSERT INTO Availed_By (custid, loan_id, balance) VALUES (?, ?, ?)', [custid, loan_id, loans[0].amount]);
        res.status(201).json({ message: 'Loan applied successfully' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'You have already applied for this loan' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.createCustomLoan = async (req, res) => {
    try {
        const { custid, loan_type, amount, branch_id } = req.body;
        
        const [result] = await pool.query(
            'INSERT INTO Loan (loan_type, amount, branch_id) VALUES (?, ?, ?)',
            [loan_type, amount, branch_id]
        );
        const loan_id = result.insertId;

        await pool.query('INSERT INTO Availed_By (custid, loan_id, balance) VALUES (?, ?, ?)', [custid, loan_id, amount]);
        
        res.status(201).json({ message: 'Custom loan approved and disbursed', loan_id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getCustomerLoans = async (req, res) => {
    try {
        const [loans] = await pool.query(`
            SELECT l.loan_id, l.loan_type, ab.balance as amount, b.name as branch_name 
            FROM Loan l 
            JOIN Availed_By ab ON l.loan_id = ab.loan_id 
            LEFT JOIN Branch b ON l.branch_id = b.branch_id 
            WHERE ab.custid = ?`, 
            [req.params.custid]);
        res.json(loans);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.repayLoan = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { custid, loan_id, account_no, repay_amount } = req.body;

        const [loans] = await connection.query('SELECT balance FROM Availed_By WHERE custid = ? AND loan_id = ?', [custid, loan_id]);
        if (loans.length === 0) throw new Error('Loan protocol not found');
        const currentBalance = parseFloat(loans[0].balance);
        
        let amountToPay;
        if (repay_amount === null || repay_amount === undefined || repay_amount === '') {
            amountToPay = currentBalance;
        } else {
            amountToPay = parseFloat(repay_amount);
        }

        if (isNaN(amountToPay) || amountToPay <= 0) throw new Error('Repayment amount must be a positive number');
        if (amountToPay > currentBalance) throw new Error('Repayment amount exceeds outstanding balance');

        const [accounts] = await connection.query('SELECT balance FROM Account WHERE account_no = ?', [account_no]);
        if (accounts.length === 0) throw new Error('Source vault not found');
        const accountBalance = parseFloat(accounts[0].balance);

        if (accountBalance < amountToPay) {
            throw new Error('Insufficient liquidity in vault to execute this repayment');
        }

        await connection.query('UPDATE Account SET balance = balance - ? WHERE account_no = ?', [amountToPay, account_no]);

        if (amountToPay >= currentBalance) {
            await connection.query('DELETE FROM Availed_By WHERE custid = ? AND loan_id = ?', [custid, loan_id]);
        } else {
            await connection.query('UPDATE Availed_By SET balance = balance - ? WHERE custid = ? AND loan_id = ?', [amountToPay, custid, loan_id]);
        }

        await connection.query(
            'INSERT INTO Transaction_Log (account_no, txn_type, amount, description, category) VALUES (?, ?, ?, ?, ?)',
            [account_no, 'DEBIT', amountToPay, `Loan Repayment (${amountToPay >= currentBalance ? 'Full' : 'Partial'}) to Paytona Capital Office`, 'Loan Repayment']
        );

        await connection.commit();
        res.json({ message: amountToPay >= currentBalance ? 'Liability Neutralized. Capital balance adjusted.' : `Partial repayment of ₹${amountToPay} successful.` });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};


