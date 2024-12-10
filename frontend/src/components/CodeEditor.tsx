import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { FileItem } from "../types";
import { File, Loader2 } from "lucide-react";

interface CodeEditorProps {
  file: FileItem | null;
  loading?: boolean;
  onContentReceive?: (content: string) => void;
}

export function CodeEditor({ 
  file, 
  loading = false, 
  onContentReceive 
}: CodeEditorProps) {
  const [displayContent, setDisplayContent] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);

  useEffect(() => {
    // Reset display content when file changes
    setDisplayContent("");
    setIsStreaming(false);

    // If file content is already available, set it immediately
    if (file?.content) {
      streamContent(file.content);
    }
  }, [file]);

  const streamContent = (content: string) => {
    if (!content) return;

    setIsStreaming(true);
    let currentIndex = 0;

    const streamInterval = setInterval(() => {
      if (currentIndex < content.length) {
        // Determine chunk size - vary between 5-15 characters for more natural streaming
        const chunkSize = Math.floor(Math.random() * 10) + 5;
        const nextChunk = content.slice(currentIndex, currentIndex + chunkSize);
        
        setDisplayContent(prev => prev + nextChunk);
        currentIndex += chunkSize;

        // Optional: Call callback if provided
        onContentReceive?.(displayContent + nextChunk);
      } else {
        clearInterval(streamInterval);
        setIsStreaming(false);
      }
    }, 20); // Adjust interval for streaming speed

    return () => clearInterval(streamInterval);
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin inline-block">
            <Loader2 className="w-8 h-8 text-cyan-500" />
          </div>
          <p className="text-zinc-400">Loading file contents...</p>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="p-3 bg-zinc-900/80 border border-zinc-800/80 rounded-lg relative group inline-block">
            <div className="absolute inset-0 bg-blue-500/20 rounded-lg blur-xl group-hover:bg-blue-500/30 transition-all duration-300" />
            <File className="w-6 h-6 text-cyan-500 relative z-10" />
          </div>
          <p className="text-zinc-400">Select a file to view its contents</p>
        </div>
      </div>
    );
  }

  return (
    <Editor
      height="100%"
      defaultLanguage="typescript"
      theme="vs-dark"
      value={displayContent}
      options={{
        readOnly: true,
        minimap: { enabled: false },
        fontSize: 14,
        wordWrap: "on",
        scrollBeyondLastLine: false,
        padding: { top: 16, bottom: 16 },
      }}
    />
  );
}