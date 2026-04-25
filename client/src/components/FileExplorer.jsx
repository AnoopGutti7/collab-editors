import { useState } from "react";

export default function FileExplorer({
  files,
  setFiles,
  active,
  setActive,
}) {
  const [newFile, setNewFile] = useState("");

  // ➕ CREATE FILE
  const createFile = () => {
    if (!newFile.trim()) return;

    if (files[newFile]) {
      alert("File already exists");
      return;
    }

    setFiles({
      ...files,
      [newFile]: "// New file",
    });

    setActive(newFile);
    setNewFile("");
  };

  // ❌ DELETE FILE
  const deleteFile = (name) => {
    if (!window.confirm("Delete file?")) return;

    const updated = { ...files };
    delete updated[name];

    setFiles(updated);
    setActive(Object.keys(updated)[0] || "");
  };

  // ✏️ RENAME FILE
  const renameFile = (oldName) => {
    const newName = prompt("Enter new file name:", oldName);
    if (!newName || newName === oldName) return;

    const updated = { ...files };
    updated[newName] = updated[oldName];
    delete updated[oldName];

    setFiles(updated);
    setActive(newName);
  };

  // 💾 SAVE FILE (DOWNLOAD)
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

  // 📂 UPLOAD FILE
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
    <div style={styles.container}>
      <h3 style={styles.title}>📁 Files</h3>

      {/* CREATE FILE */}
      <div style={styles.createBox}>
        <input
          value={newFile}
          onChange={(e) => setNewFile(e.target.value)}
          placeholder="file name (e.g main.cpp)"
          style={styles.input}
        />
        <button onClick={createFile} style={styles.addBtn}>
          + Add
        </button>
      </div>

      {/* FILE LIST */}
      <div style={styles.fileList}>
        {Object.keys(files).map((name) => (
          <div
            key={name}
            style={{
              ...styles.fileItem,
              background:
                active === name ? "#2d2d2d" : "transparent",
            }}
            onClick={() => setActive(name)}
          >
            <span>{name}</span>

            <div style={styles.actions}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  renameFile(name);
                }}
                style={styles.smallBtn}
              >
                ✏️
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteFile(name);
                }}
                style={styles.deleteBtn}
              >
                ❌
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* UPLOAD */}
      <label style={styles.uploadBtn}>
        📂 Upload
        <input
          type="file"
          hidden
          onChange={uploadFile}
        />
      </label>

      {/* SAVE */}
      <button onClick={saveFile} style={styles.saveBtn}>
        💾 Save File
      </button>
    </div>
  );
}

/* 🎨 STYLES */
const styles = {
  container: {
    width: "220px",
    background: "#1e1e1e",
    color: "white",
    padding: "10px",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },

  title: {
    marginBottom: "5px",
  },

  createBox: {
    display: "flex",
    gap: "5px",
  },

  input: {
    flex: 1,
    padding: "6px",
    background: "#333",
    border: "none",
    color: "white",
  },

  addBtn: {
    background: "#0e639c",
    border: "none",
    color: "white",
    padding: "6px",
    cursor: "pointer",
  },

  fileList: {
    display: "flex",
    flexDirection: "column",
    gap: "5px",
  },

  fileItem: {
    padding: "6px",
    cursor: "pointer",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actions: {
    display: "flex",
    gap: "5px",
  },

  smallBtn: {
    background: "#444",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  deleteBtn: {
    background: "#c0392b",
    border: "none",
    color: "white",
    cursor: "pointer",
  },

  uploadBtn: {
    background: "#444",
    padding: "8px",
    textAlign: "center",
    cursor: "pointer",
  },

  saveBtn: {
    background: "#0e639c",
    padding: "8px",
    border: "none",
    color: "white",
    cursor: "pointer",
  },
};