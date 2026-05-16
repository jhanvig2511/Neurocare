const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const db = require("./db");
const fs = require("fs");
const axios = require("axios");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

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

  // Doctor comes online
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

const authRoutes = require("./routes/auth");
const chatRoutes = require("./routes/chat");
const adminRoutes = require("./routes/admin");
const therapistRoutes = require("./routes/therapist");

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
   STATIC UPLOADS
======================= */

app.use("/uploads", express.static("uploads"));

/* =======================
   MULTER
======================= */

const upload = multer({
  dest: "uploads/",
});

/* =======================
   SPEECH TO TEXT
======================= */

async function speechToText(filePath) {
  const audio = fs.readFileSync(filePath);

  const response = await axios.post(
    "https://api.openai.com/v1/audio/transcriptions",
    audio,
    {
      headers: {
        "Content-Type": "audio/mpeg",
        Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      params: {
        model: "whisper-1",
      },
    }
  );

  return response.data.text;
}

/* =======================
   GENERATE BOT REPLY
======================= */

async function generateReply(text) {
  const response = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a supportive mental health assistant.",
        },
        {
          role: "user",
          content: text,
        },
      ],
    },
    {
      headers: {
        Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  return response.data.choices[0]
    .message.content;
}

/* =======================
   TEXT TO SPEECH
======================= */

async function textToSpeech(text) {
  const ttsResponse = await axios.post(
    "https://api.openai.com/v1/audio/speech",
    {
      model: "tts-1",
      voice: "alloy",
      input: text,
    },
    {
      responseType: "arraybuffer",
      headers: {
        Authorization:
          `Bearer ${process.env.OPENAI_API_KEY}`,
      },
    }
  );

  const filename =
    `reply-${uuidv4()}.mp3`;

  const filepath =
    `uploads/${filename}`;

  fs.writeFileSync(
    filepath,
    Buffer.from(ttsResponse.data)
  );

  return filepath;
}

/* =======================
   VOICE CHAT ENDPOINT
======================= */

app.post(
  "/api/voice",
  upload.single("audio"),
  async (req, res) => {
    try {
      const audioPath = req.file.path;

      // Speech → Text
      const userText =
        await speechToText(audioPath);

      // AI Reply
      const botText =
        await generateReply(userText);

      // Text → Speech
      const replyAudioPath =
        await textToSpeech(botText);

      res.status(200).json({
        userText,
        botText,
        audioUrl:
          `http://localhost:${process.env.PORT}/${replyAudioPath}`,
      });

    } catch (err) {

      console.error(
        "Voice processing error:",
        err.response?.data || err.message
      );

      res.status(500).json({
        message:
          "Error processing voice message",
      });
    }
  }
);

/* =======================
   DEFAULT ROUTE
======================= */

app.get("/", (req, res) => {
  res.send(
    "Mental Health Chatbot Backend Running"
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
