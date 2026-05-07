const mongoose = require('mongoose');

const taskSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    picture: {
        type: String,
        trim: true,
    },
    dueDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['BACK-LOG', 'TODO', 'IN-PROGRESS', 'COMPLETED'],
        default: 'TODO',
    },
    tags: [String],
    assignedTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    }],
}, {timestamps: true});

const Task = mongoose.model('Task', taskSchema);
module.exports = Task;
