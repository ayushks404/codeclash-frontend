
import React from "react";
import Editor from "@monaco-editor/react";
import { Code, Lock } from "lucide-react";

export default function CodeEditor({ code, setCode, contestExpired }) {
  return (
    <div className="relative">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-950/50 border border-slate-700 rounded-t-xl">
        <div className="flex items-center gap-2">
          <Code className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-slate-300">Code Editor</span>
        </div>
        {contestExpired && (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-lg">
            <Lock className="w-3 h-3 text-red-400" />
            <span className="text-xs text-red-300 font-medium">Read Only</span>
          </div>
        )}
      </div>

      {/* Editor */}
      <div className="relative border-x border-b border-slate-700 rounded-b-xl overflow-hidden">
        <Editor
          height="400px"
          defaultLanguage="cpp"
          value={code}
          onChange={(value) => setCode(value)}
          theme="vs-dark"
          options={{
            readOnly: contestExpired,
            minimap: { enabled: false },
            fontSize: 14,
            scrollBeyondLastLine: false,
            fontFamily: "'Fira Code', 'Consolas', 'Courier New', monospace",
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: "all",
            scrollbar: {
              useShadows: false,
              verticalScrollbarSize: 10,
              horizontalScrollbarSize: 10,
            },
            padding: {
              top: 16,
              bottom: 16,
            },
          }}
        />

        {/* Expired Overlay */}
        {contestExpired && (
          <div className="absolute inset-0 bg-black/20 pointer-events-none flex items-center justify-center">
            <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-xl px-6 py-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-400" />
                <span className="text-red-300 font-semibold">Editor Locked</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-2 flex items-center justify-between px-2 text-xs text-slate-500">
        <span>Press Ctrl+Space for autocomplete</span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          Monaco Editor
        </span>
      </div>
    </div>
  );
}
