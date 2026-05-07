// controllers/messageController.js
const Message = require("../models/message");

async function handleGetAllMessages(req, res) {
    try {
        const messages = await Message.find().populate("sender", "name email type");
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: "Error fetching messages", error });
    }
};

module.exports = {
    handleGetAllMessages,
};