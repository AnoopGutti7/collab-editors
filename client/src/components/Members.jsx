import { useEffect, useState } from "react";
import { socket } from "../socket";

export default function Members({ roomId, username, navigate }) {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    socket.on("users", (data) => {
      // ✅ ensure always array + remove nulls
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
    <div style={styles.container}>
      <h3 style={styles.title}>Members</h3>

      {/* BUTTONS */}
      <button style={styles.copy} onClick={copyRoomId}>
        📋 Copy Room ID
      </button>

      <button style={styles.leave} onClick={leaveRoom}>
        🚪 Leave Room
      </button>

      {/* USERS */}
      <div style={styles.users}>
        {users.length === 0 ? (
          <p style={styles.empty}>No users</p>
        ) : (
          users.map((user, i) => {
            if (!user || typeof user !== "string") return null;

            return (
              <div key={i} style={styles.user}>
                <div style={styles.avatar}>
                  {user.charAt(0).toUpperCase()}
                </div>

                <span>
                  {user} {user === username && "(You)"}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "100%",
    background: "#161b22",
    color: "white",
    padding: "15px",
    borderBottom: "1px solid #30363d",
  },

  title: {
    marginBottom: "10px",
    fontSize: "16px",
  },

  copy: {
    width: "100%",
    padding: "10px",
    background: "#238636",
    border: "none",
    color: "white",
    marginBottom: "10px",
    cursor: "pointer",
    borderRadius: "5px",
  },

  leave: {
    width: "100%",
    padding: "10px",
    background: "#da3633",
    border: "none",
    color: "white",
    marginBottom: "15px",
    cursor: "pointer",
    borderRadius: "5px",
  },

  users: {
    marginTop: "10px",
  },

  user: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },

  avatar: {
    width: "35px",
    height: "35px",
    borderRadius: "8px",
    background: "#30363d",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginRight: "10px",
    fontWeight: "bold",
  },

  empty: {
    color: "#888",
    textAlign: "center",
  },
};