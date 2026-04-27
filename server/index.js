import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";
import dotenv from "dotenv";


dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Backend is running...");
});
  
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [process.env.FRONTEND_URL, "http://localhost:5173"],
    credentials: true,
  },
});

/* =========================
   DATABASE
========================= */
mongoose.connect(
  "mongodb+srv://guttianoop1_db_user:test123@cluster0.regbknp.mongodb.net/collab-editor?retryWrites=true&w=majority"
);

mongoose.connection.on("connected", () => {
  console.log("✅ MongoDB Connected");
});

/* =========================
   MODELS
========================= */
const Message = mongoose.model(
  "Message",
  new mongoose.Schema(
    {
      roomId: String,
      username: String,
      message: String,
    },
    { timestamps: true }
  )
);

const Code = mongoose.model(
  "Code",
  new mongoose.Schema({
    roomId: String,
    file: String,
    code: String,
  })
);

/* =========================
   SOCKET
========================= */
const rooms = {};

io.on("connection", (socket) => {
  console.log("🔌 Connected:", socket.id);

  socket.on("join-room", async ({ roomId, username }) => {
    socket.join(roomId);
    socket.data = { roomId, username };

    if (!rooms[roomId]) rooms[roomId] = [];
    if (!rooms[roomId].includes(username)) {
      rooms[roomId].push(username);
    }

    io.to(roomId).emit("users", rooms[roomId]);

    // Load chat
    const msgs = await Message.find({ roomId }).sort({ createdAt: 1 });
    socket.emit("load-messages", msgs);

    // Load code
    const files = await Code.find({ roomId });
    files.forEach((f) => socket.emit("receive-code", f));
  });

  socket.on("send-message", async (data) => {
    const msg = await Message.create(data);
    io.to(data.roomId).emit("receive-message", msg);
  });

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
   RUN CODE
========================= */
const runCommand = (cmd, args, input = "", cwd = __dirname) => {
  return new Promise((resolve) => {
    let output = "";
    let error = "";

    const child = spawn(cmd, args, { cwd });

    child.stdout.on("data", (d) => (output += d.toString()));
    child.stderr.on("data", (d) => (error += d.toString()));

    child.on("close", () => resolve({ output, error }));

    if (input) child.stdin.write(input);
    child.stdin.end();
  });
};

app.post("/run", async (req, res) => {
  const { code, language, input } = req.body;

  const dir = path.join(__dirname, "temp");
  await fs.mkdir(dir, { recursive: true });

  try {
    if (language === "javascript") {
      const file = path.join(dir, "main.js");
      await fs.writeFile(file, code);
      const result = await runCommand("node", [file], input, dir);
      return res.json(result);
    }

    if (language === "python") {
      const file = path.join(dir, "main.py");
      await fs.writeFile(file, code);
      const result = await runCommand("python", [file], input, dir);
      return res.json(result);
    }

    // C++
    const file = path.join(dir, "main.cpp");
    const exe = path.join(dir, "main");

    await fs.writeFile(file, code);

    const compile = await runCommand("g++", [file, "-o", exe], "", dir);
    if (compile.error) return res.json({ error: compile.error });

    const result = await runCommand(exe, [], input, dir);
    return res.json(result);

  } catch (e) {
    res.json({ error: e.message });
  }
});

/* ========================= */
server.listen(process.env.PORT || 5000, () =>
  console.log("🚀 Server running")
);