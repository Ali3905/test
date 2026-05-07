const jwt = require("jsonwebtoken");
const User = require("../models/user");

const verifyUser = async (req, res, next) => {
    try {
        // console.log({cookies: req.cookies});
        const token = req.cookies.authtoken;
        
        if (!token) {
            return res.status(401).json({ message: "No token provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return res.status(401).json({ message: "Invalid token: user not found" });
        }

        req.user = user; // attach user to req object
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
};

const checkUser = async (req, res, next) => {
    try {
        // console.log({cookies: req.cookies});
        const token = req.cookies.authtoken;
        
        if (!token) {
            return req.user = null, next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.id).select("-password");

        if (!user) {
            return req.user = null, next();
        }

        req.user = user; // attach user to req object
        next();
    } catch (error) {
        return res.status(401).json({ message: "Unauthorized", error: error.message });
    }
};

module.exports = { verifyUser, checkUser };
