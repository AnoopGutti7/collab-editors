import React, { useState, useEffect, useRef } from "react";
import { socket } from "../socket";
import "./ChatBox.css";

export default function ChatBox({ roomId, username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  // RECEIVE MESSAGE
  useEffect(() => {
    socket.on("receive-message", (data) => {
      setMessages((prev) => [...prev, data]);
    });

    return () => socket.off("receive-message");
  }, []);

  // AUTO SCROLL
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop =
        messagesRef.current.scrollHeight;
    }
  }, [messages]);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!message.trim()) return;

    const data = { roomId, username, message };

    socket.emit("send-message", data);
    setMessage("");
  };

  return (
    <div className="chat-container">

      <div className="chat-title">Chat</div>

      <div className="chat-body" ref={messagesRef}>
        {messages.length === 0 ? (
          <p className="empty">No messages yet</p>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.username === username;

            return (
              <div
                key={index}
                className={`msg-wrapper ${isMe ? "me" : "other"}`}
              >
                {/* show username for others */}
                {!isMe && (
                  <div className="msg-username">
                    {msg.username}
                  </div>
                )}

                <div className={`msg ${isMe ? "me" : "other"}`}>
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />

        <button onClick={sendMessage}>Send</button>
      </div>

    </div>
  );
}