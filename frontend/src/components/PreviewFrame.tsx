'use client'

import { WebContainer } from '@webcontainer/api';
import React, { useEffect, useState } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';

interface PreviewFrameProps {
  files: any[];
  webContainer?: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function main() {
    if (!webContainer) return;

    try {
      setLoading(true);
      setError(null);

      const installProcess = await webContainer.spawn('npm', ['install']);
      
      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      await webContainer.spawn('npm', ['run', 'dev']);

      webContainer.on('server-ready', (port, serverUrl) => {
        console.log(serverUrl);
        console.log(port);
        setUrl(serverUrl);
        setLoading(false);
      });
    } catch (error) {
      console.error('Error setting up WebContainer:', error);
      setError('Failed to set up the preview. Please try again.');
      setLoading(false);
    }
  }

  useEffect(() => {
    if (webContainer) {
      main();
    }
  }, [webContainer]);
  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        {loading && (
          <div className="flex items-center justify-center h-96 bg-gray-100">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <span className="ml-2 text-lg font-medium text-gray-600">Setting up preview...</span>
          </div>
        )}
        {error && (
          <div className="flex items-center justify-center h-96 bg-red-50">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <span className="ml-2 text-lg font-medium text-red-700">{error}</span>
          </div>
        )}
        {url && (
          <iframe 
            src={url} 
            className="w-full h-[600px] border-none"
            title="Preview"
          />
        )}
      </div>
    </div>
  );
}

export function App() {
  const [webContainer, setWebContainer] = useState<WebContainer | undefined>(undefined);

  useEffect(() => {
    async function initWebContainer() {
      try {
        const container = await WebContainer.boot();
        setWebContainer(container);
      } catch (error) {
        console.error('Failed to initialize WebContainer:', error);
      }
    }

    initWebContainer();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">WebContainer Preview</h1>
      <PreviewFrame 
        webContainer={webContainer} 
        files={[]} // Provide an empty array or your actual files
      />
    </div>
  );
}

