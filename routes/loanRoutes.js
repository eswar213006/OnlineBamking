const express = require('express');
const router = express.Router();
const loanController = require('../controllers/loanController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, loanController.getAllLoans);
router.post('/apply', authMiddleware, loanController.applyLoan);
router.post('/custom', authMiddleware, loanController.createCustomLoan);
router.post('/repay', authMiddleware, loanController.repayLoan);
router.get('/:custid', authMiddleware, loanController.getCustomerLoans);

module.exports = router;
