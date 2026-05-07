const mongoose = require("mongoose")

const applicationSchema = mongoose.Schema({
    desiredDesignation: {
        type: String,
        required: true
    },
    about: String,
    why: String,
    status: {
        type: String,
        enum: ["DEFAULT", "SHORTLISTED", "ACCEPTED", "REJECTED"],
        default: "DEFAULT"
    },
    interviewDate: Date,
    interviewRemarks: String
}, {timestamps: true})

const application = mongoose.model("application", applicationSchema)
module.exports = application