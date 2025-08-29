
// frontend/src/components/CodeEditor.jsx
import React from "react";
import Editor from "@monaco-editor/react";

export default function CodeEditor({ code, setCode, contestExpired }) {
  return (
    <div style={{ height: "300px", border: "1px solid #ddd", borderRadius: "6px" }}>
      <Editor
        height="100%"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => setCode(value)}
        theme="vs-dark"
        options={{
          readOnly: contestExpired,
          minimap: { enabled: false },
          fontSize: 14,
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
}
