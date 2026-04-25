const rooms = {};

export const setupSocket = (io) => {
  io.on("connection", (socket) => {

    socket.on("join-room", ({ roomId, username }) => {
      socket.join(roomId);

      socket.data.username = username;
      socket.data.roomId = roomId;

      if (!rooms[roomId]) {
        rooms[roomId] = [];
      }

      // avoid duplicates
      if (!rooms[roomId].includes(username)) {
        rooms[roomId].push(username);
      }

      io.to(roomId).emit("users", rooms[roomId]);
    });

    socket.on("disconnect", () => {
      const { roomId, username } = socket.data;

      if (roomId && rooms[roomId]) {
        rooms[roomId] = rooms[roomId].filter((u) => u !== username);
        io.to(roomId).emit("users", rooms[roomId]);
      }
    });

  });
};