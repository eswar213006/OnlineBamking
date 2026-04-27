const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/:id', authMiddleware, customerController.getCustomerProfile);
router.put('/:id', authMiddleware, customerController.updateProfile);

module.exports = router;
