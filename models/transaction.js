const mongoose = require('mongoose');

const transactionSchema = mongoose.Schema({
    // type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    amount: { type: Number, required: true },
    // description: { type: String },
    source: { type: String }, // e.g., "Sponsorship", "Ticket Sales"
    date: { type: Date, default: Date.now },
    // recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // optional
    // eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' }, // if linked to an event
}, { timestamps: true });

const Transaction = mongoose.model('Transaction', transactionSchema);
module.exports = Transaction;