import { useState } from "react";
import { FileCode2, FolderOpen, Pencil, Plus, Save, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import "./FileExplorer.css";

export default function FileExplorer({ files, setFiles, active, setActive }) {
  const [newFile, setNewFile] = useState("");

  const createFile = () => {
    const fileName = newFile.trim();
    if (!fileName) return;

    if (files[fileName]) {
      alert("File already exists");
      return;
    }

    setFiles({
      ...files,
      [fileName]: "// New file",
    });

    setActive(fileName);
    setNewFile("");
  };

  const deleteFile = (name) => {
    if (!window.confirm("Delete file?")) return;

    const updated = { ...files };
    delete updated[name];

    setFiles(updated);
    setActive(Object.keys(updated)[0] || "");
  };

  const renameFile = (oldName) => {
    const newName = prompt("Enter new file name:", oldName);
    if (!newName || newName === oldName) return;

    const updated = { ...files };
    updated[newName] = updated[oldName];
    delete updated[oldName];

    setFiles(updated);
    setActive(newName);
  };

  const saveFile = () => {
    if (!active) return;

    const blob = new Blob([files[active]], {
      type: "text/plain",
    });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = active;
    link.click();
  };

  const uploadFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      setFiles({
        ...files,
        [file.name]: event.target.result,
      });
      setActive(file.name);
    };

    reader.readAsText(file);
  };

  return (
    <aside className="file-panel">
      <div className="file-panel-header">
        <div>
          <span>Project</span>
          <h2>
            <FolderOpen size={18} />
            Files
          </h2>
        </div>
        <span className="file-count">{Object.keys(files).length}</span>
      </div>

      <div className="file-create">
        <input
          value={newFile}
          onChange={(e) => setNewFile(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && createFile()}
          placeholder="main.cpp"
        />
        <Button className="icon-action add-file" size="icon" onClick={createFile} aria-label="Add file">
          <Plus size={16} />
        </Button>
      </div>

      <div className="file-list">
        {Object.keys(files).map((name) => (
          <button
            key={name}
            className={`file-item ${active === name ? "active" : ""}`}
            onClick={() => setActive(name)}
            type="button"
          >
            <span className="file-name">
              <FileCode2 size={16} />
              {name}
            </span>

            <span className="file-actions">
              <span
                role="button"
                tabIndex={0}
                className="mini-action"
                onClick={(e) => {
                  e.stopPropagation();
                  renameFile(name);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    renameFile(name);
                  }
                }}
                aria-label={`Rename ${name}`}
              >
                <Pencil size={13} />
              </span>

              <span
                role="button"
                tabIndex={0}
                className="mini-action danger"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(name);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.stopPropagation();
                    deleteFile(name);
                  }
                }}
                aria-label={`Delete ${name}`}
              >
                <Trash2 size={13} />
              </span>
            </span>
          </button>
        ))}
      </div>

      <div className="file-tools">
        <label className="tool-button">
          <Upload size={15} />
          Upload
          <input type="file" hidden onChange={uploadFile} />
        </label>

        <button className="tool-button" onClick={saveFile} type="button">
          <Save size={15} />
          Save file
        </button>
      </div>
    </aside>
  );
}
