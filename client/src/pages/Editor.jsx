import { useEffect, useState } from "react";
import { socket } from "../socket";
import FileExplorer from "../components/FileExplorer";
import Members from "../components/Members";
import ChatBox from "../components/ChatBox";
import axios from "axios";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Editor from "@monaco-editor/react";
import "./EditorUI.css";

export default function EditorPage() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const username = state?.username;

  const [files, setFiles] = useState({
    devops: "// New file",
  });

  const [activeFile, setActiveFile] = useState("devops");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("cpp");

  /* =========================
     CONNECT SOCKET
  ========================= */
  useEffect(() => {
    if (!username) navigate("/");

    socket.connect();
    socket.emit("join-room", { roomId, username });

    return () => socket.disconnect();
  }, []);

  /* =========================
     RECEIVE CODE (SYNC)
  ========================= */
  useEffect(() => {
    socket.on("receive-code", ({ file, code }) => {
      setFiles((prev) => {
        // prevent unnecessary re-render loop
        if (prev[file] === code) return prev;

        return {
          ...prev,
          [file]: code,
        };
      });
    });

    return () => socket.off("receive-code");
  }, []);

  /* =========================
     RUN CODE
  ========================= */
  const runCode = async () => {
    try {
      setOutput("Running...");

      const res = await axios.post("http://localhost:5000/run", {
        code: files[activeFile],
        language,
        input,
      });

      setOutput(res.data.output || res.data.error || "No output");
    } catch {
      setOutput("Error running code");
    }
  };

  /* =========================
     UI
  ========================= */
  return (
    <div className="editor-container">

      {/* LEFT PANEL */}
      <div className="files-container">
        <FileExplorer
          files={files}
          setFiles={setFiles}
          active={activeFile}
          setActive={setActiveFile}
        />
      </div>

      {/* CENTER */}
      <div className="center-container">

        {/* TOP BAR */}
        <div className="topbar">
          <button className="run-btn" onClick={runCode}>
            ▶ Run
          </button>

          <select
            className="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="javascript">JavaScript</option>
            <option value="python">Python</option>
          </select>
        </div>

        {/* EDITOR */}
        <div className="editor-box">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            value={files[activeFile] || ""}
            
            onChange={(value) => {
              const newCode = value || "";

              // update local
              setFiles((prev) => ({
                ...prev,
                [activeFile]: newCode,
              }));

              // send to others
              socket.emit("code-change", {
                roomId,
                file: activeFile,
                code: newCode,
              });
            }}

            theme="vs-dark"
          />
        </div>

        {/* INPUT OUTPUT */}
        <div className="io-container">

          <div className="input-box">
            <h3>Input</h3>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="output-box">
            <h3>Output</h3>
            <pre>{output}</pre>
          </div>

        </div>

      </div>

      {/* RIGHT PANEL */}
      <div className="right-panel">
        <Members
          roomId={roomId}
          username={username}
          navigate={navigate}
        />

        <div className="chat-wrapper">
          <ChatBox roomId={roomId} username={username} />
        </div>
      </div>

    </div>
  );
}