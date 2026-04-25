import { useEffect, useState } from "react";
import axios from "axios";
import Editor from "@monaco-editor/react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { Code2, Play, Terminal, UsersRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { socket } from "../socket";
import FileExplorer from "../components/FileExplorer";
import Members from "../components/Members";
import ChatBox from "../components/ChatBox";
import "./EditorUi.css";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function EditorPage() {
  const { roomId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();

  const username = state?.username;

  const [files, setFiles] = useState({
    "main.cpp": "// New file",
  });

  const [activeFile, setActiveFile] = useState("main.cpp");
  const [output, setOutput] = useState("");
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("cpp");

  useEffect(() => {
    if (!username) navigate("/");

    socket.connect();
    socket.emit("join-room", { roomId, username });

    return () => socket.disconnect();
  }, [navigate, roomId, username]);

  useEffect(() => {
    socket.on("receive-code", ({ file, code }) => {
      setFiles((prev) => {
        if (prev[file] === code) return prev;

        return {
          ...prev,
          [file]: code,
        };
      });
    });

    return () => socket.off("receive-code");
  }, []);

  const runCode = async () => {
    try {
      setOutput("Running...");

      const res = await axios.post(`${API_URL}/run`, {
        code: files[activeFile],
        language,
        input,
      });

      setOutput(res.data.output || res.data.error || "No output");
    } catch (error) {
      console.error(error);
      setOutput("Error running code");
    }
  };

  return (
    <div className="editor-container">
      <div className="files-container">
        <FileExplorer
          files={files}
          setFiles={setFiles}
          active={activeFile}
          setActive={setActiveFile}
        />
      </div>

      <div className="center-container">
        <div className="topbar">
          <div className="workspace-title">
            <div className="workspace-icon">
              <Code2 size={18} />
            </div>
            <div>
              <span>Workspace</span>
              <strong>{activeFile || "No file selected"}</strong>
            </div>
          </div>

          <div className="topbar-actions">
            <select
              className="lang-select"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              aria-label="Select language"
            >
              <option value="cpp">C++</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>

            <Button className="run-btn" onClick={runCode}>
              <Play size={15} />
              Run
            </Button>
          </div>
        </div>

        <div className="editor-box">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            value={files[activeFile] || ""}
            onChange={(value) => {
              const newCode = value || "";

              setFiles((prev) => ({
                ...prev,
                [activeFile]: newCode,
              }));

              socket.emit("code-change", {
                roomId,
                file: activeFile,
                code: newCode,
              });
            }}
            theme="vs-dark"
          />
        </div>

        <div className="io-container">
          <div className="input-box">
            <h3>
              <Terminal size={15} />
              Input
            </h3>
            <textarea
              placeholder="Optional stdin for your program"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
          </div>

          <div className="output-box">
            <h3>
              <Terminal size={15} />
              Output
            </h3>
            <pre>{output || "Run your code to see output here."}</pre>
          </div>
        </div>
      </div>

      <div className="right-panel">
        <div className="panel-heading">
          <UsersRound size={17} />
          Collaboration
        </div>

        <Members roomId={roomId} username={username} navigate={navigate} />

        <div className="chat-wrapper">
          <ChatBox roomId={roomId} username={username} />
        </div>
      </div>
    </div>
  );
}
