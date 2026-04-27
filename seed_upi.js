const pool = require('./db');

async function seedUPI() {
    try {
        console.log('🌱 Seeding Premium Test Handles...');
        
        // 1. Create a "Merchant" user
        const testEmail = `merchant_${Date.now()}@paytona.com`;
        const testPhone = Math.floor(6000000000 + Math.random() * 3000000000).toString();
        const [merchant] = await pool.query('INSERT INTO Customer (name, email, password, phone, address) VALUES (?, ?, ?, ?, ?)', 
            ['Paytona Merchant', testEmail, '$2b$10$nS/QnF78Y5Yp1D2Y3Z4X5O', testPhone, 'Silicon Valley']);
        const merchantId = merchant.insertId;

        // 2. Create multiple accounts for this merchant
        const testHandles = [
            { id: 'coffee@paytona', type: 'Merchant' },
            { id: 'netflix@paytona', type: 'Subs' },
            { id: 'tesla@paytona', type: 'Investment' },
            { id: 'charity@paytona', type: 'Donation' }
        ];

        for(const handle of testHandles) {
            const accNo = Math.floor(100000 + Math.random() * 900000);
            await pool.query('INSERT INTO Account (account_no, acc_type, balance, branch_id, upi_id) VALUES (?, ?, ?, ?, ?)',
                [accNo, handle.type, 50000.00, 1, handle.id]);
            await pool.query('INSERT INTO Hold_By (custid, account_no) VALUES (?, ?)', [merchantId, accNo]);
            console.log(`✅ Registered: ${handle.id} [${handle.type} Vault]`);
        }

        console.log('🚀 Seeding complete. All handles are now LIVE.');
        process.exit();
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

seedUPI();
