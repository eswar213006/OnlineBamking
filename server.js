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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
