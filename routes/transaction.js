const express = require('express');
const router = express.Router();

const { createTransaction, getAllTransactions } = require('../controllers/transaction');

router.post('/', createTransaction);
router.get('/', getAllTransactions);

module.exports = router;