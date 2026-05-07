const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");
const logger = require('../utils/logger');

async function handleSignup(req, res) {
    const { name, email, password, mobileNumber, batch, registrationNo, isAridian, university } = req.body;
    

    try {
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email, and password are required' });
        }

        if (password.length < 5) {
            return res.status(400).json({ message: 'Password must be at least 5 characters long' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: 'Invalid email format' });
        }

        if (mobileNumber && (mobileNumber.length < 10 || mobileNumber.length >= 13)) {
            return res.status(400).json({ message: 'Mobile number must be between 10 and 12 characters' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate verification token
        const token = crypto.randomBytes(32).toString("hex");

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            mobileNumber,
            batch,
            isAridian,
            university,

            registrationNo,
            verificationToken: token,
            verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hrs
        });

        // Send verification email
        const verifyURL = `${process.env.CLIENT_URL}/auth/verify-email?token=${token}`;

        await sendEmail({
            from: 'onboarding@resend.dev',
            to: email,
            subject: "Verify your email",
            html: `
                <h2>Hello ${name},</h2>
                <p>Verify your email by clicking the link below:</p>
                <a href="${verifyURL}" style="color:blue; font-size:16px;">Verify Email</a>
                <p>Link expires in 24 hours.</p>
            `
        });

        res.status(201).json({
            success: true,
            message: "User created. Verification email sent!",
        });

    } catch (error) {
        res.status(500).json({ success: false, message: 'Something went wrong', error: error.message });
    }
}


async function handleLogin(req, res) {
    const { email, password } = req.body;
    logger.info("user_login_attempt", { email });

    try {
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const foundUser = await User.findOne({ email });
        if (!foundUser) {
            logger.warn("user_login_failed", { email, reason: "user_not_found" });
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(password, foundUser.password);
        if (!isPasswordValid) {
            logger.warn("user_login_failed", { email, reason: "invalid_password" });
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!foundUser.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email before logging in.' });
        }

        const token = jwt.sign({ id: foundUser._id, email: foundUser.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.cookie("authtoken", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "PRODUCTION", // true in prod
            sameSite: process.env.NODE_ENV === "PRODUCTION" ? "None" : "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        })


        // Exclude password before sending response
        const { password: _, ...userData } = foundUser.toObject();

        logger.info("user_login_success", { userId: foundUser._id, email });
        res.status(200).json({ message: 'Login successful', token, data: userData });
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
};

async function verifyEmail(req, res) {
    try {
        const { token } = req.query;

        if (!token) {
            return res.status(400).json({ success: false, message: "Token is required" });
        }

        const foundUser = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!foundUser) {
            return res.status(400).json({
                success: false,
                message: "Invalid or expired token"
            });
        }

        // Mark email as verified
        foundUser.isVerified = true;
        foundUser.verificationToken = undefined;
        foundUser.verificationTokenExpires = undefined;

        await foundUser.save();

        const authToken = jwt.sign({ id: foundUser._id, email: foundUser.email }, process.env.JWT_SECRET, { expiresIn: "30d" });

        res.cookie("authtoken", authToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "PRODUCTION", // true in prod
            sameSite: process.env.NODE_ENV === "PRODUCTION" ? "None" : "Lax",
            maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
        })

        return res.status(200).json({
            success: true,
            message: "Email verified successfully! You can now log in.",
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};


async function handleGetCabinetMembers(req, res) {
    try {
        const foundMembers = await User.find({ type: "CABINET-MEMBER" })
        if (!foundMembers) {
            return res.status(400).json({
                success: false,
                message: "Could not find the cabinet members",
            })
        }
        return res.status(200).json({
            success: true,
            data: foundMembers
        })
    } catch (error) {
        res.status(500).json({ message: 'Something went wrong', error: error.message });
    }
}

// async function handleGetUserProfile(req, res) {
//     try {
//         const userId = req.user._id; // Assuming user is attached to req by middleware
//         const user = await User.findById(userId).select('-password');
//         if (!user) return res.status(404).json({ message: 'User not found' });
//         res.status(200).json({ data: user });
//     } catch (error) {
//         res.status(500).json({ message: 'Something went wrong', error: error.message });
//     }
// }

async function handleGetUserProfile(req, res) {
    const token = req?.cookies?.authtoken;

    if (!token) return res.status(401).json({ success: false, message: 'No token' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded.id) {
            return res.status(403).json({ success: false, message: 'Invalid token' });
        }
        const foundUser = await User.findById(decoded.id).select('-password');
        if (!foundUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        res.json({ success: true, data: foundUser });
    } catch {
        res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

async function handleLogout(req, res) {
    try {
        res.clearCookie("authtoken", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "PRODUCTION",
            sameSite: process.env.NODE_ENV === "PRODUCTION" ? "None" : "Lax",
        });

        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: error.message });
    }
}


module.exports = {
    handleLogin,
    handleSignup,
    handleGetCabinetMembers,
    handleGetUserProfile,
    handleLogout,
    verifyEmail
    // handleCheckAuth
};
