import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuid } from "uuid";
import { ArrowRight, Code2, Copy, Sparkles, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BackgroundGradient } from "@/components/aceternity/background-gradient";
import "./Home.css";

export default function Home() {
  const [username, setUsername] = useState("");
  const [roomId, setRoomId] = useState("");
  const navigate = useNavigate();

  const createRoom = () => {
    const id = uuid();
    setRoomId(id);
    navigator.clipboard?.writeText(id);
  };

  const handleJoin = () => {
    if (!username || !roomId) return alert("Enter details");

    navigate(`/editor/${roomId}`, {
      state: { username },
    });
  };

  return (
    <div className="home-shell">
      <section className="home-hero" aria-label="Collaborative editor sign in">
        <div className="brand-mark">
          <Code2 size={24} />
        </div>

        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={15} />
            Real-time code rooms
          </div>
          <h1>Build together in one shared editor.</h1>
          <p>
            Create a room, invite your team, write code, run snippets, and keep the
            conversation beside the workspace.
          </p>
        </div>

        <div className="hero-stats" aria-label="Workspace features">
          <div>
            <UsersRound size={18} />
            <span>Live members</span>
          </div>
          <div>
            <Code2 size={18} />
            <span>Monaco editor</span>
          </div>
          <div>
            <Copy size={18} />
            <span>Shareable rooms</span>
          </div>
        </div>
      </section>

      <BackgroundGradient containerClassName="join-gradient">
        <form
          className="join-card"
          onSubmit={(e) => {
            e.preventDefault();
            handleJoin();
          }}
        >
          <div>
            <p className="form-kicker">Start session</p>
            <h2>Join workspace</h2>
            <p className="subtitle">Enter your name and room ID to continue.</p>
          </div>

          <label className="field">
            <span>Username</span>
            <input
              type="text"
              placeholder="e.g. Anoop"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </label>

          <label className="field">
            <span>Room ID</span>
            <input
              type="text"
              placeholder="Paste or create a room"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
            />
          </label>

          <Button className="join-button" type="submit">
            Enter room
            <ArrowRight size={16} />
          </Button>

          <button className="create-room" type="button" onClick={createRoom}>
            Create a fresh room ID
          </button>
        </form>
      </BackgroundGradient>
    </div>
  );
}
