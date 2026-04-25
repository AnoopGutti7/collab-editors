import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, language, theme }) {
  return (
    <Editor
      height="100%"
      language={language}
      value={code}
      theme={theme}
      onChange={(val) => setCode(val)}
      options={{
        fontSize: 14,
        minimap: { enabled: false },
      }}
    />
  );
}