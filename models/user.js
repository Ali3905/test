const mongoose = require("mongoose")

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    mobileNumber: String,
    batch: String,
    registrationNo: String,
    type: {
        type: String,
        enum: ["CABINET-MEMBER", "MEMBER", "APPLICANT", "USER"],
        default: "USER"
    },

    isAridian: { type: Boolean },
    university: String,

    isVerified: { type: Boolean, default: false },
    verificationToken: String,
    verificationTokenExpires: Date,

}, { timestamps: true })

const User = mongoose.model("User", userSchema)
module.exports = User