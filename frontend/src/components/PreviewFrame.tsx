import React, { useEffect, useState } from 'react';
import { WebContainer } from '@webcontainer/api';
import { Loader2Icon, ServerIcon, CodeIcon } from 'lucide-react';

interface PreviewFrameProps {
  files: any[];
  webContainer: WebContainer;
}

export function PreviewFrame({ files, webContainer }: PreviewFrameProps) {
  const [url, setUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'installing' | 'building' | 'ready' | 'error'>('idle');
  const [progress, setProgress] = useState<string>('Initializing WebContainer...');

  async function main() {
    try {
      setStatus('installing');
      setProgress('Installing dependencies...');
      
      const installProcess = await webContainer.spawn('npm', ['install']);

      installProcess.output.pipeTo(new WritableStream({
        write(data) {
          console.log(data);
        }
      }));

      setStatus('building');
      setProgress('Starting development server...');
      await webContainer.spawn('npm', ['run', 'dev']);

      // Wait for `server-ready` event
      webContainer.on('server-ready', (port, url) => {
        console.log(url);
        console.log(port);
        setUrl(url);
        setStatus('ready');
        setProgress('Preview is ready!');
      });
    } catch (error) {
      console.error('WebContainer initialization error:', error);
      setStatus('error');
      setProgress('Failed to start preview');
    }
  }

  useEffect(() => {
    main();
  }, []);

  const renderLoadingState = () => {
    const statusIcons = {
      idle: <ServerIcon className="w-12 h-12 text-gray-400 animate-pulse" />,
      installing: <Loader2Icon className="w-12 h-12 text-blue-500 animate-spin" />,
      building: <CodeIcon className="w-12 h-12 text-green-500 animate-bounce" />,
      ready: <ServerIcon className="w-12 h-12 text-green-600" />,
      error: <ServerIcon className="w-12 h-12 text-red-500" />
    };

    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gray-50 rounded-lg">
        <div className="mb-4">
          {statusIcons[status]}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            {status === 'error' ? 'Oops! Something went wrong' : 'Preparing Your Preview'}
          </h2>
          <p className="text-gray-500 max-w-md">
            {progress}
          </p>
          {status === 'error' && (
            <button 
              onClick={() => main()} 
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="h-full w-full relative overflow-hidden rounded-lg shadow-lg">
      {!url ? (
        renderLoadingState()
      ) : (
        <div className="absolute inset-0">
          <iframe 
            src={url} 
            width="100%" 
            height="100%" 
            className="border-none w-full h-full"
          />
          <div className="absolute top-2 right-2 bg-white/80 px-3 py-1 rounded-full text-sm text-gray-700 shadow-md">
            🌐 Preview Ready
          </div>
        </div>
      )}
    </div>
  );
}

export default PreviewFrame;