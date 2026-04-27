import { io } from "socket.io-client";

export const socket = io("https://collab-editors-1.onrender.com/", {
  transports: ["polling", "websocket"],
});