import  { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StepsList } from '../components/StepsList';
import { FileExplorer } from '../components/FileExplorer';
import { TabView } from '../components/TabView';
import { PreviewFrame } from '../components/PreviewFrame';
import { Step, FileItem, StepType } from '../types';
import axios from 'axios';
import { BACKEND_URL, NODE_ENV } from '../config';
import { parseXml } from '../steps';
import { useWebContainer } from '../hooks/useWebContainer';
import { Loader } from '../components/Loader';
import JSZip from 'jszip';
import { 
  Download
} from 'lucide-react';
import { ChatInput } from '../components/ChatInput';

export function Builder() {
  const location = useLocation();
  const { prompt } = location.state as { prompt: string };
  const [userPrompt, setPrompt] = useState("");
  const [llmMessages, setLlmMessages] = useState<{role: "user" | "assistant", content: string, timestamp?: Date}[]>([]);
  const [loading, setLoading] = useState(false);
  const [templateSet, setTemplateSet] = useState(false);
  const webcontainer = useWebContainer();

  const [currentStep, setCurrentStep] = useState(1);
  const [activeTab, setActiveTab] = useState<'code' | 'preview'>('code');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  
  const [steps, setSteps] = useState<Step[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);

  const productionUrl = "https://bolt-green.vercel.app/";
  const downloadProjectAsZip = async () => {
    const zip = new JSZip();
  
   
    const addFilesToZip = (file:any, folder:any) => {
      if (file.type === 'file') {
        folder.file(file.path, file.content || '');
      } else if (file.type === 'folder' && file.children) {
        const subFolder = folder.folder(file.name);
        file.children.forEach((child:any) => addFilesToZip(child, subFolder));
      }
    };
  
   
    files.forEach((file) => addFilesToZip(file, zip));
  
   
    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'react-project.zip';
    link.click();
  };
  

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles]; 
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }

    })

    if (updateHappened) {

      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => {
        return {
          ...s,
          status: "completed"
        }
        
      }))
    }
    console.log(files);
  }, [steps, files]);

  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          // For folders, create a directory entry
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            // For files, create a file entry with contents
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      // Process each top-level file/folder
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    // Mount the structure if WebContainer is available
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

 
  useEffect(() => {
    init();
  }, [])

  useEffect(() => {
    let originalFiles = [...files];
    let updateHappened = false;
    steps.filter(({status}) => status === "pending").map(step => {
      updateHappened = true;
      if (step?.type === StepType.CreateFile) {
        let parsedPath = step.path?.split("/") ?? [];
        let currentFileStructure = [...originalFiles];
        let finalAnswerRef = currentFileStructure;
  
        let currentFolder = ""
        while(parsedPath.length) {
          currentFolder =  `${currentFolder}/${parsedPath[0]}`;
          let currentFolderName = parsedPath[0];
          parsedPath = parsedPath.slice(1);
  
          if (!parsedPath.length) {
            // final file
            let file = currentFileStructure.find(x => x.path === currentFolder)
            if (!file) {
              currentFileStructure.push({
                name: currentFolderName,
                type: 'file',
                path: currentFolder,
                content: step.code
              })
            } else {
              file.content = step.code;
            }
          } else {
            /// in a folder
            let folder = currentFileStructure.find(x => x.path === currentFolder)
            if (!folder) {
              // create the folder
              currentFileStructure.push({
                name: currentFolderName,
                type: 'folder',
                path: currentFolder,
                children: []
              })
            }
  
            currentFileStructure = currentFileStructure.find(x => x.path === currentFolder)!.children!;
          }
        }
        originalFiles = finalAnswerRef;
      }
    })

    if (updateHappened) {
      setFiles(originalFiles)
      setSteps(steps => steps.map((s: Step) => ({
        ...s,
        status: "completed"
      })))
    }
    console.log(files);
  }, [steps, files]);

  // Existing mount structure useEffect
  useEffect(() => {
    const createMountStructure = (files: FileItem[]): Record<string, any> => {
      const mountStructure: Record<string, any> = {};
  
      const processFile = (file: FileItem, isRootFolder: boolean) => {  
        if (file.type === 'folder') {
          mountStructure[file.name] = {
            directory: file.children ? 
              Object.fromEntries(
                file.children.map(child => [child.name, processFile(child, false)])
              ) 
              : {}
          };
        } else if (file.type === 'file') {
          if (isRootFolder) {
            mountStructure[file.name] = {
              file: {
                contents: file.content || ''
              }
            };
          } else {
            return {
              file: {
                contents: file.content || ''
              }
            };
          }
        }
  
        return mountStructure[file.name];
      };
  
      files.forEach(file => processFile(file, true));
  
      return mountStructure;
    };
  
    const mountStructure = createMountStructure(files);
  
    console.log(mountStructure);
    webcontainer?.mount(mountStructure);
  }, [files, webcontainer]);

  async function init() {
    const response = await axios.post(`${BACKEND_URL}/template`, {
      prompt: prompt.trim()
    });
    setTemplateSet(true);
    
    const {prompts, uiPrompts} = response.data;

    setSteps(parseXml(uiPrompts[0]).map((x: Step) => ({
      ...x,
      status: "pending"
    })));

    setLoading(true);
    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
      messages: [...prompts, prompt].map(content => ({
        role: "user",
        content
      }))
    })

    setLoading(false);

    setSteps(s => [...s, ...parseXml(stepsResponse.data.response).map(x => ({
      ...x,
      status: "pending" as "pending"
    }))]);

    setLlmMessages([...prompts, prompt].map(content => ({
      role: "user",
      content
    })));

    setLlmMessages(x => [...x, {role: "assistant", content: stepsResponse.data.response}])
  }

  useEffect(() => {
    init();
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col">
      <header className="bg-gray-800 border-b border-gray-700 px-4 py-3 flex flex-col md:flex-row justify-between items-center shadow-md">
        <div className="text-center md:text-left">
          <h1 className="text-xl md:text-2xl font-bold text-white">AI Website Builder</h1>
          <p className="text-sm text-gray-400 mt-1 max-w-md truncate">Prompt: {prompt}</p>
        </div>
        <button
          onClick={downloadProjectAsZip}
          className="mt-2 md:mt-0 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300 ease-in-out"
        >
          <Download className="w-5 h-5" />
          <span>Download Project</span>
        </button>
      </header>

      <div className="flex-1 overflow-hidden">
        <div className="h-full grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6 p-4 md:p-6">
          {/* Steps List */}
          <div className="md:col-span-1 space-y-6 overflow-auto bg-gray-800 rounded-lg p-4 shadow-lg">
            <div className="max-h-[50vh] md:max-h-[65vh] overflow-auto rounded-md">
              <StepsList
                steps={steps}
                currentStep={currentStep}
                onStepClick={setCurrentStep}
              />
            </div>
            <div className="mt-4">
              {(loading || !templateSet) && <Loader />}
              {!(loading || !templateSet) && (
                <ChatInput
                  value={userPrompt}
                  onChange={setPrompt}
                  onSubmit={async () => {
                    const newMessage = {
                      role: "user" as "user",
                      content: userPrompt,
                    };

                    setLoading(true);
                    const stepsResponse = await axios.post(`${BACKEND_URL}/chat`, {
                      messages: [...llmMessages, newMessage],
                    });
                    setLoading(false);

                    setLlmMessages((x) => [...x, newMessage]);
                    setLlmMessages((x) => [
                      ...x,
                      { role: "assistant", content: stepsResponse.data.response },
                    ]);

                    setSteps((s) => [
                      ...s,
                      ...parseXml(stepsResponse.data.response).map((x) => ({
                        ...x,
                        status: "pending" as "pending",
                      })),
                    ]);
                  }}
                  isLoading={loading}
                />
              )}
            </div>
          </div>

          {/* File Explorer */}
          <div className="md:col-span-1 bg-gray-800 rounded-lg shadow-lg overflow-auto hidden md:block">
            <FileExplorer files={files} onFileSelect={setSelectedFile} isLoading={loading || !templateSet} />
          </div>

          {/* Code and Preview */}
          <div className="md:col-span-2 bg-gray-900 rounded-lg shadow-lg flex flex-col">
            <TabView
              activeTab={activeTab}
              onTabChange={(tab) => {
                console.log("Tab changed to:", tab);
                setActiveTab(tab);
              }}
            />
            <div className="h-[calc(100%-4rem)] overflow-auto">
            {activeTab === "preview" && (
  <PreviewFrame 
    webContainer={webcontainer}
    deploymentUrl={productionUrl}
    files={files} 
  />
)}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
