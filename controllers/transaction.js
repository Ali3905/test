const Transaction = require('../models/transaction');

async function createTransaction(req, res) {
  try {
    const { amount, source, date } = req.body;

    if (!amount || !source) {
      return res.status(400).json({ error: 'Amount and source are required.' });
    }

    const transaction = new Transaction({
      amount,
      source,
      date: date ? new Date(date) : undefined,
    });

    const savedTransaction = await transaction.save();
    res.status(201).json({
      success: true,
      data: savedTransaction,
    });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ error: error?.message || 'Something went wrong while creating the transaction.' });
  }
}

async function getAllTransactions(req, res) {
  try {
    const transactions = await Transaction.find().sort({ date: -1 });
    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error('Get All Transactions Error:', error);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
}

module.exports = {
  createTransaction,
  getAllTransactions,
};