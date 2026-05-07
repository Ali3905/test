const express = require('express');
const { handleSignup, handleLogin, handleGetCabinetMembers, handleGetUserProfile, handleCheckAuth, handleLogout, verifyEmail } = require('../controllers/user');
const { verifyUser } = require('../middleware/user');
const logger = require('../utils/logger');

const router = express.Router();

router.post('/signup', handleSignup);
router.post('/login', handleLogin);
router.get('/cabinet', handleGetCabinetMembers)
router.get('/profile', verifyUser, handleGetUserProfile)
router.post('/logout', handleLogout);
router.get('/verify-email', verifyEmail);
// router.get('/check', handleCheckAuth);

module.exports = router;
