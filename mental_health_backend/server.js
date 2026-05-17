const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db");

/* SOCKET.IO */
const http = require("http");
const { Server } = require("socket.io");

dotenv.config();

const app = express();

/* =======================
   CREATE HTTP SERVER
======================= */
const server = http.createServer(app);

/* =======================
   SOCKET.IO
======================= */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

/* =======================
   ONLINE DOCTORS
======================= */
let onlineDoctors = {};

/* =======================
   SOCKET CONNECTION
======================= */
io.on("connection", (socket) => {

  console.log("User Connected");

  // Doctor Online
  socket.on("doctorOnline", (doctorId) => {

    onlineDoctors[doctorId] = socket.id;

    console.log(`Doctor ${doctorId} Online`);
  });

  // User books session
  socket.on("bookSession", ({ doctorId, user }) => {

    const doctorSocket =
      onlineDoctors[doctorId];

    if (doctorSocket) {

      io.to(doctorSocket).emit(
        "newBooking",
        {
          message:
            `${user} booked a session`,
        }
      );
    }
  });

  /* =======================
     REALTIME CHAT
  ======================= */

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);
  });

  socket.on("sendMessage", (data) => {

    io.to(data.room).emit(
      "receiveMessage",
      data
    );
  });

  socket.on("disconnect", () => {

    console.log("Disconnected");
  });
});

/* =======================
   ROUTES
======================= */

const authRoutes =
  require("./routes/auth");

const chatRoutes =
  require("./routes/chat");

const adminRoutes =
  require("./routes/admin");

const therapistRoutes =
  require("./routes/therapist");

/* =======================
   MIDDLEWARE
======================= */

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(bodyParser.json());

/* =======================
   DEFAULT ROUTE
======================= */

app.get("/", (req, res) => {

  res.send(
    "Mental Health Backend Running"
  );
});

/* =======================
   API ROUTES
======================= */

app.use("/api/auth", authRoutes);

app.use("/api/chat", chatRoutes);

app.use("/api/admin", adminRoutes);

app.use(
  "/api/therapist",
  therapistRoutes
);

/* =======================
   GET USERS
======================= */

app.get("/users", (req, res) => {

  const sql = "SELECT * FROM users";

  db.query(sql, (err, results) => {

    if (err) {

      console.error(
        "Error fetching users:",
        err
      );

      return res.status(500).json({
        message:
          "Error fetching users",
      });
    }

    res.status(200).json(results);
  });
});

/* =======================
   SERVER START
======================= */

const PORT =
  process.env.PORT || 5000;

server.listen(PORT, () => {

  console.log(
    `🚀 Server running on port ${PORT}`
  );

});