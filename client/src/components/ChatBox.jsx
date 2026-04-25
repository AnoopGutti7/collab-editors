import { useState, useEffect, useRef } from "react";
import { MessageSquareText, SendHorizonal } from "lucide-react";
import { socket } from "../socket";
import "./ChatBox.css";

export default function ChatBox({ roomId, username }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const messagesRef = useRef(null);

  useEffect(() => {
    const loadMessages = (data) => {
      setMessages(Array.isArray(data) ? data : []);
    };

    const receiveMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    socket.on("load-messages", loadMessages);
    socket.on("receive-message", receiveMessage);

    return () => {
      socket.off("load-messages", loadMessages);
      socket.off("receive-message", receiveMessage);
    };
  }, [roomId]);

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

    const data = {
      roomId,
      username,
      message: message.trim(),
    };

    socket.emit("send-message", data);
    setMessage("");
  };

  return (
    <div className="chat-container">
      <div className="chat-title">
        <MessageSquareText size={16} />
        Chat
      </div>

      <div className="chat-body" ref={messagesRef}>
        {messages.length === 0 ? (
          <p className="empty">No messages yet.</p>
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

        <button onClick={sendMessage} aria-label="Send message">
          <SendHorizonal size={16} />
        </button>
      </div>

    </div>
  );
}
