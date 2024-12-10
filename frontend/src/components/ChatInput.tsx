import React from 'react';
import { Link2, Sparkles } from 'lucide-react';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, isLoading }: ChatInputProps) {
  return (
    <div className="relative bg-gray-900 rounded-lg border border-gray-800 p-4">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="How can Shirox AI help you today?"
        className="w-full min-h-[100px] bg-transparent text-gray-300 placeholder-gray-500 resize-none focus:outline-none text-lg"
      />
      <div className="flex justify-between items-center mt-2">
        <div className="flex gap-2">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Link2 className="w-5 h-5 text-gray-400" />
          </button>
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Sparkles className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            isLoading
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-purple-600 text-white hover:bg-purple-700'
          }`}
        >
          {isLoading ? 'Processing...' : 'Send'}
        </button>
      </div>
    </div>
  );
}