const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db");

const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();
const server = http.createServer(app);

/* =======================
   FRONTEND URL (PRODUCTION SAFE)
======================= */
const FRONTEND_URL =
  process.env.FRONTEND_URL || "*";

/* =======================
   MIDDLEWARE
======================= */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

app.use(bodyParser.json());

/* =======================
   SOCKET.IO SETUP
======================= */
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

/* =======================
   ONLINE DOCTORS MAP
======================= */
let onlineDoctors = {};

/* =======================
   SOCKET CONNECTION
======================= */
io.on("connection", (socket) => {
  console.log("User Connected:", socket.id);

  /* DOCTOR ONLINE */
  socket.on("doctorOnline", (doctorId) => {
    socket.join(doctorId);
    onlineDoctors[doctorId] = socket.id;

    console.log(`Doctor ${doctorId} Online`);
  });

  /* BOOK SESSION */
  socket.on("bookSession", ({ doctorId, user }) => {
    io.to(doctorId).emit("newBooking", {
      message: `${user} booked a session`,
      doctorId,
      user,
    });
  });

  /* JOIN CHAT ROOM */
  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
    console.log("Joined room:", roomId);
  });

  /* SEND MESSAGE */
  socket.on("sendMessage", (data) => {
    io.to(data.roomId).emit("receiveMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("User Disconnected:", socket.id);
  });
});

/* =======================
   ROUTES
======================= */
const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const adminRoutes = require("./routes/admin");
const therapistRoutes = require("./routes/therapist");

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/therapist", therapistRoutes);

/* =======================
   TEST ROUTE
======================= */
app.get("/", (req, res) => {
  res.send("Mental Health Backend Running 🚀");
});

/* =======================
   USERS API
======================= */
app.get("/users", (req, res) => {
  const sql = "SELECT * FROM users";

  db.query(sql, (err, results) => {
    if (err) {
      console.error("DB Error:", err.message);
      return res.status(500).json({
        message: "Error fetching users",
      });
    }

    res.status(200).json(results);
  });
});

/* =======================
   SERVER START
======================= */
const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});