import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import "./Home.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuid();
    setRoomId(id);
  };

  const handleJoin = () => {
    if (!username || !roomId) return alert("Enter details");

    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">

        <h1>Log in</h1>

        <p className="subtitle">
          Log in to your account and continue your coding session
        </p>

        <div className="input-group">
          <input
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          />
        </div>

        <button onClick={handleJoin}>Log in</button>

        <p className="footer">
          Don’t have room? <span onClick={createRoom}>Create</span>
        </p>

      </div>
    </div>
  );
}