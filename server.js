require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const accountRoutes = require('./routes/accountRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const loanRoutes = require('./routes/loanRoutes');
const adminRoutes = require('./routes/adminRoutes');
const featureRoutes = require('./routes/featureRoutes');

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/customer', customerRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/loans', loanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/features', featureRoutes);

// Public Health Check Route
app.get('/api/status', async (req, res) => {
    try {
        const pool = require('./db');
        await pool.query('SELECT 1');
        res.json({
            status: '✅ ONLINE',
            system: 'Paytona Core Backend',
            database: 'Connected (bank)',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({ status: '❌ OFFLINE', error: err.message });
    }
});
const path = require('path');

// Serve static assets from React build in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
