const express = require('express');
const router = express.Router();
const beneficiaryController = require('../controllers/beneficiaryController');
const fdController = require('../controllers/fdController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Beneficiaries
router.post('/beneficiaries', authMiddleware, beneficiaryController.addBeneficiary);
router.get('/beneficiaries/:custid', authMiddleware, beneficiaryController.getBeneficiaries);
router.delete('/beneficiaries/:id', authMiddleware, beneficiaryController.deleteBeneficiary);

// Fixed Deposits
router.post('/fd', authMiddleware, fdController.createFD);
router.get('/fd/:custid', authMiddleware, fdController.getFDs);

module.exports = router;
