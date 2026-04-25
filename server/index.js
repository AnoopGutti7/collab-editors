import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import mongoose from "mongoose";
import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
}, { timestamps: true });

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
    const msgs = await Message.find({ roomId }).sort({ createdAt: 1 });
    socket.emit("load-messages", msgs);

    /* 🔥 LOAD CODE */
    const files = await Code.find({ roomId });
    files.forEach((f) => {
      socket.emit("receive-code", f);
    });
  });

  /* CHAT */
  socket.on("send-message", async (data) => {
    if (!data?.roomId || !data?.username || !data?.message?.trim()) return;

    const savedMessage = await Message.create({
      roomId: data.roomId,
      username: data.username,
      message: data.message.trim(),
    });

    io.to(data.roomId).emit("receive-message", savedMessage);
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

const runCommand = (command, args, input = "", cwd = __dirname) => {
  return new Promise((resolve) => {
    let output = "";
    let error = "";

    const child = spawn(command, args, {
      cwd,
      shell: false,
      windowsHide: true,
    });

    const timeout = setTimeout(() => {
      child.kill();
      resolve({ output: "", error: "Execution timed out" });
    }, 8000);

    child.stdout.on("data", (data) => {
      output += data.toString();
    });

    child.stderr.on("data", (data) => {
      error += data.toString();
    });

    child.on("error", (err) => {
      clearTimeout(timeout);
      resolve({ output, error: err.message });
    });

    child.on("close", () => {
      clearTimeout(timeout);
      resolve({ output, error });
    });

    if (input) {
      child.stdin.write(input);
    }
    child.stdin.end();
  });
};

app.post("/run", async (req, res) => {
  const { code = "", language = "cpp", input = "" } = req.body || {};

  if (!code.trim()) {
    return res.json({ output: "", error: "No code provided" });
  }

  const runId = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const runDir = path.join(__dirname, "temp-runs", runId);

  try {
    await fs.mkdir(runDir, { recursive: true });

    if (language === "javascript") {
      const filePath = path.join(runDir, "main.js");
      await fs.writeFile(filePath, code);
      const result = await runCommand("node", [filePath], input, runDir);
      return res.json(result);
    }

    if (language === "python") {
      const filePath = path.join(runDir, "main.py");
      await fs.writeFile(filePath, code);
      const result = await runCommand("python", [filePath], input, runDir);
      return res.json(result);
    }

    const sourcePath = path.join(runDir, "main.cpp");
    const outputPath = path.join(runDir, process.platform === "win32" ? "main.exe" : "main");
    await fs.writeFile(sourcePath, code);

    const compile = await runCommand("g++", [sourcePath, "-o", outputPath], "", runDir);
    if (compile.error) {
      return res.json({ output: "", error: compile.error });
    }

    const result = await runCommand(outputPath, [], input, runDir);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ output: "", error: error.message });
  } finally {
    await fs.rm(runDir, { recursive: true, force: true }).catch(() => {});
  }
});

server.listen(5000, () => {
  console.log("🚀 Server running on port 5000");
});
