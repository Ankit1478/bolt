import React from 'react';
import { ChevronDown, ChevronRight, File, Folder } from 'lucide-react';
import { FileItem } from '../types';

interface FileExplorerProps {
  files: FileItem[];
  onFileSelect: (file: FileItem) => void;
  isLoading?: boolean;
}

export function FileExplorer({ files, onFileSelect, isLoading = false }: FileExplorerProps) {
  const renderFileTree = (items: FileItem[], level = 0) => {
    return items.map((item) => (
      <div key={item.path} style={{ paddingLeft: `${level * 16}px` }}>
        <button
          onClick={() => item.type === 'file' && onFileSelect(item)}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            item.type === 'file'
              ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
              : 'text-gray-400'
          }`}
        >
          {item.type === 'folder' ? (
            <>
              <ChevronRight className="w-4 h-4 text-gray-500" />
              <Folder className="w-4 h-4 text-blue-400" />
            </>
          ) : (
            <File className="w-4 h-4 text-cyan-400" />
          )}
          <span className="text-sm truncate">{item.name}</span>
        </button>
        {item.type === 'folder' && item.children && renderFileTree(item.children, level + 1)}
      </div>
    ));
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent text-blue-400 rounded-full" />
        <p className="mt-2 text-sm text-gray-400">Loading files...</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-white mb-4">Project Files</h2>
      <div className="space-y-1">{renderFileTree(files)}</div>
    </div>
  );
}