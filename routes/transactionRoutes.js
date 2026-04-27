const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.post('/deposit', authMiddleware, transactionController.deposit);
router.post('/withdraw', authMiddleware, transactionController.withdraw);
router.post('/transfer/initiate', authMiddleware, transactionController.initiateTransfer);
router.post('/upi/initiate', authMiddleware, transactionController.initiateUPITransfer);
router.post('/upi/handle', authMiddleware, transactionController.updateUPIHandle);
router.post('/transfer', authMiddleware, transactionController.verifyTransfer);
router.get('/history/:account_no', authMiddleware, transactionController.getHistory);
router.get('/analytics/:custid', authMiddleware, transactionController.getAnalytics);

module.exports = router;
