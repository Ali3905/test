const Message = require("./models/message");
const User = require("./models/user");

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log("New user connected:", socket.id);

    socket.on("send-message", async ({ senderId, content }) => {
      try {
        const message = await Message.create({ sender: senderId, content });
        const foundUser = await User.findById(senderId);
        if (!foundUser) {
          console.error("Sender not found:", senderId);
          return;
        }

        // Send to all connected users
        io.emit("receive-message", {
          _id: message._id,
          sender: foundUser,
          content,
          createdAt: message.createdAt
        });
      } catch (err) {
        console.error("Message save error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};

module.exports = initSocket;
