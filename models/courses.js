const mongoose = require('mongoose');

const InstructorSchema = {
    name: {
        type: String,
        required: true,
    },
    // email: {
    //     type: String,
    //     required: true,
    //     unique: true,
    // },
    // phone: {
    //     type: String,
    //     required: true,
    // },
}

const courseSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    duration: {
        type: String,
        required: true,
    },
    tags: {
        type: [{
            type: String,
            trim: true,
            lowercase: true,
        }],
        default: [],
    },
    status: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'ARCHIVED'],
        default: 'ACTIVE',
    },
    instructor: InstructorSchema,
    picture: {
        type: String,
    },
    students: {
        type: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }],
        default: [],
    },
}, { timestamps: true });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
