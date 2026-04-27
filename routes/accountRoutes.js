const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/branches/all', authMiddleware, accountController.getBranches);
router.get('/:custid', authMiddleware, accountController.getAccounts);
router.get('/balance/:account_no', authMiddleware, accountController.getBalance);
router.post('/', authMiddleware, accountController.createAccount);

module.exports = router;
