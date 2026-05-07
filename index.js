require("dotenv").config()
require('newrelic');

const express = require("express")
const cors = require("cors")
const multer = require("multer")
const { connectToMongo } = require("./connections")
const http = require("http");
const socketIO = require("socket.io");
const initSocket = require("./socket")
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const logger = require("./utils/logger");

// Initializing App
const app = express()
const PORT = process.env.PORT || 6000
const server = http.createServer();
const io = socketIO(server, {
    cors: {
        origin: ["http://localhost:3000"],
        credentials: true
    }
});
io.listen(5000)
initSocket(io);
connectToMongo(process.env.MONGO_URI || "mongodb://localhost:27017/AASS")


app.use(cors({
    origin: ["http://localhost:3000", "http://localhost:3001", "https://aass-client.vercel.app", "https://aass-client.onrender.com"],
    credentials: true
}))
app.use(express.json())
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }))

// Multer setup for handling form-data
const upload = multer()
app.use(upload.any())

// Morgan middleware using winston stream
app.use(morgan("combined", { stream: { write: message => logger.http(message.trim()) } }));

// Health Check Route
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});


// Routes
const authRoute = require("./routes/user")
const eventRoute = require("./routes/event")
const taskRoute = require("./routes/task")
const courseRoute = require("./routes/course")
const messageRoute = require("./routes/message");
const transactionRoute = require("./routes/transaction");

app.use("/api/auth", authRoute)
app.use("/api/events", eventRoute)
app.use("/api/tasks", taskRoute)
app.use("/api/courses", courseRoute)
app.use("/api/messages", messageRoute);
app.use("/api/transactions", transactionRoute);

app.get("/", (req, res) => {
    res.send("AASS Server is running")
})

app.listen(PORT, () => {
    console.log("Server is running on", PORT);
})