import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Users({ username }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("users", setUsers);
    return () => socket.off("users");
  }, []);

  return (
    <div>
      {users.map((u, i) => (
        <div key={i}>
          👤 {u} {u === username && "(You)"}
        </div>
      ))}
    </div>
  );
}