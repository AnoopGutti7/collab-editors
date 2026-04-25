const rooms = {};

export const setupSocket = (io) => {
  io.on("connection", (socket) => {

    // ✅ JOIN ROOM
    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);

      socket.data.username = username;
      socket.data.roomId = roomId;

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      if (!rooms[roomId].includes(username)) {
        rooms[roomId].push(username);
      }

      io.to(roomId).emit("users", rooms[roomId]);
    });

    // 🔥 ADD THIS → CHAT FEATURE
    socket.on("send-message", ({ roomId, message, username }) => {
      io.to(roomId).emit("receive-message", {
        message,
        username,
        time: new Date().toLocaleTimeString(),
      });
    });

    // 🔥 ADD THIS → CODE SYNC
    socket.on("code-change", ({ roomId, file, code }) => {
      socket.to(roomId).emit("receive-code", { file, code });
    });

    // ❌ DISCONNECT
    socket.on("disconnect", () => {
      const { roomId, username } = socket.data;

      if (roomId && rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((u) => u !== username);
        io.to(roomId).emit("users", rooms[roomId]);
      }
    });

  });
};