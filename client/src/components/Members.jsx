import { useEffect, useState } from "react";
import { Copy, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socket } from "../socket";
import "./Members.css";

export default function Members({ roomId, username, navigate }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("users", (data) => {
      setUsers(Array.isArray(data) ? data.filter(Boolean) : []);
    });

    return () => socket.off("users");
  }, []);

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId);
    alert("Room ID copied!");
  };

  const leaveRoom = () => {
    navigate("/");
    window.location.reload();
  };

  return (
    <section className="members-card">
      <div className="room-card">
        <span>Room ID</span>
        <code>{roomId}</code>
      </div>

      <div className="member-actions">
        <Button className="copy-room" onClick={copyRoomId}>
          <Copy size={15} />
          Copy
        </Button>

        <Button className="leave-room" onClick={leaveRoom}>
          <LogOut size={15} />
          Leave
        </Button>
      </div>

      <div className="members-list-header">
        <span>Members</span>
        <strong>{users.length}</strong>
      </div>

      <div className="members-list">
        {users.length === 0 ? (
          <p className="members-empty">No users online</p>
        ) : (
          users.map((user, i) => {
            if (!user || typeof user !== "string") return null;

            return (
              <div key={`${user}-${i}`} className="member-item">
                <div className="member-avatar">
                  {user.charAt(0).toUpperCase() || <UserRound size={15} />}
                </div>

                <span>
                  {user}
                  {user === username && <em>You</em>}
                </span>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
