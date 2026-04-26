import { io } from "socket.io-client";

export const socket = io("https://colabeditor-1.onrender.com", {
  transports: ["polling", "websocket"],
});