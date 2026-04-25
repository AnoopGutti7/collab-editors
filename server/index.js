import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});


mongoose.connect(
 
  "mongodb+srv://guttianoop1_db_user:test123@cluster0.regbknp.mongodb.net/collab-editor?retryWrites=true&w=majorrity"
);

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected");
});

/* =========================
   📦 MODELS
========================= */
const messageSchema = new mongoose.Schema({
  roomId: String,
  username: String,
  message: String,
});

const Message = mongoose.model("Message", messageSchema);

const codeSchema = new mongoose.Schema({
  roomId: String,
  file: String,
  code: String,
});

const Code = mongoose.model("Code", codeSchema);

/* =========================
   ROOMS (TEMP)
========================= */
const rooms = {};

/* =========================
   SOCKET
========================= */
io.on("connection", (socket) => {
  console.log("🔌 User connected");

  socket.on("join-room", async ({ roomId, username }) => {
    socket.join(roomId);
    socket.data = { roomId, username };

    if (!rooms[roomId]) rooms[roomId] = [];
    if (!rooms[roomId].includes(username)) {
      rooms[roomId].push(username);
    }

    io.to(roomId).emit("users", rooms[roomId]);

    /* 🔥 LOAD CHAT */
    const msgs = await Message.find({ roomId });
    socket.emit("load-messages", msgs);

    /* 🔥 LOAD CODE */
    const files = await Code.find({ roomId });
    files.forEach((f) => {
      socket.emit("receive-code", f);
    });
  });

  /* CHAT */
  socket.on("send-message", async (data) => {
    await Message.create(data);
    io.to(data.roomId).emit("receive-message", data);
  });

  /* CODE */
  socket.on("code-change", async ({ roomId, file, code }) => {
    socket.to(roomId).emit("receive-code", { file, code });

    await Code.findOneAndUpdate(
      { roomId, file },
      { code },
      { upsert: true }
    );
  });

  socket.on("disconnect", () => {
    const { roomId, username } = socket.data || {};
    if (roomId && rooms[roomId]) {
      rooms[roomId] = rooms[roomId].filter((u) => u !== username);
      io.to(roomId).emit("users", rooms[roomId]);
    }
  });
});

/* =========================
   TEST API
========================= */
app.get("/test", async (req, res) => {
  const codes = await Code.find();
  res.json(codes);
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});