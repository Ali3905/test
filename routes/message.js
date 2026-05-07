// routes/messageRoutes.js
const express = require("express");
const { handleGetAllMessages } = require("../controllers/message");
const router = express.Router();

router.get("/", handleGetAllMessages);

module.exports = router;
