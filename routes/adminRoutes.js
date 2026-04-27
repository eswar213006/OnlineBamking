const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

router.post('/login', adminController.login);
router.get('/customers', authMiddleware, adminMiddleware, adminController.getAllCustomers);
router.get('/accounts', authMiddleware, adminMiddleware, adminController.getAllAccounts);
router.get('/transactions', authMiddleware, adminMiddleware, adminController.getAllTransactions);
router.delete('/customer/:id', authMiddleware, adminMiddleware, adminController.deleteCustomer);

module.exports = router;
