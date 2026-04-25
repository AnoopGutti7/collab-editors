// rooms.js

const rooms = {};

// Create or get room
export const getRoom = (roomId) => {
  if (!rooms[roomId]) {
    rooms[roomId] = {
      users: [],
      code: "// Start coding...",
    };
  }
  return rooms[roomId];
};

// Add user
export const addUser = (roomId, username) => {
  const room = getRoom(roomId);

  if (!room.users.includes(username)) {
    room.users.push(username);
  }

  return room.users;
};

// Remove user
export const removeUser = (roomId, username) => {
  const room = rooms[roomId];
  if (!room) return;

  room.users = room.users.filter((u) => u !== username);

  // delete room if empty
  if (room.users.length === 0) {
    delete rooms[roomId];
  }
};

// Update code
export const updateCode = (roomId, code) => {
  const room = getRoom(roomId);
  room.code = code;
};

// Get code
export const getCode = (roomId) => {
  return getRoom(roomId).code;
};