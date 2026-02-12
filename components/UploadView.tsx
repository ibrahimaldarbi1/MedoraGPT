import React, { useState } from 'react';
import { Upload, FileText, Loader2, Sparkles, AlertCircle, Key, File as FileIcon } from 'lucide-react';
import { Course, MaterialStatus } from '../types';
import { SAMPLE_TEXT } from '../constants';

interface UploadViewProps {
  courses: Course[];
  onUpload: (courseId: string, title: string, text: string) => Promise<void>;
}

const UploadView: React.FC<UploadViewProps> = ({ courses, onUpload }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>(courses[0]?.id || '');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showKeySelector, setShowKeySelector] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!title) {
        setError("Please enter a lecture title.");
        return;
    }
    setError(null);
    setShowKeySelector(false);
    setIsProcessing(true);
    try {
        await onUpload(selectedCourse, title, text || SAMPLE_TEXT);
    } catch (e: any) {
        const msg = e.toString();
        // Check for specific 404 or "Requested entity was not found" error which implies bad key/model access
        if (msg.includes("Requested entity was not found") || msg.includes("404")) {
            setError("API Error: The selected API Key may be invalid for this model.");
            setShowKeySelector(true);
            try {
                if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
                    await (window as any).aistudio.openSelectKey();
                }
            } catch (k) {
                console.error("Could not open key selector", k);
            }
        } else {
            setError("Failed to generate study pack. " + (e.message || "Please check your connection."));
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const handleChangeKey = async () => {
      try {
          if ((window as any).aistudio && (window as any).aistudio.openSelectKey) {
              await (window as any).aistudio.openSelectKey();
          }
      } catch (k) {
          console.error("Could not open key selector", k);
      }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (event) => {
              const content = event.target?.result as string;
              setText(content);
              setFileName(file.name);
              if (!title) {
                  setTitle(file.name.replace(/\.[^/.]+$/, ""));
              }
          };
          reader.readAsText(file);
      } else {
          setError("Currently only .txt and .md files are supported for browser-only parsing. For PDFs, copy/paste the text below.");
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload Material</h1>
        <p className="text-slate-500 mt-2">Turn your lecture notes into a study system in seconds.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Course Select */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Select Course</label>
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Title Input */}
        <div>
           <label className="block text-sm font-medium text-slate-700 mb-2">Lecture Title</label>
           <input 
              type="text" 
              placeholder="e.g., Week 3: Nervous System"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
           />
        </div>

        {/* Upload Zone */}
        <div className="relative border-2 border-dashed border-slate-200 rounded-xl p-8 text-center bg-slate-50 hover:bg-slate-100 transition-colors group">
           <input 
              type="file" 
              accept=".txt,.md"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
           />
           <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
             {fileName ? <FileIcon size={24} /> : <Upload size={24} />}
           </div>
           {fileName ? (
               <p className="font-medium text-slate-900">{fileName}</p>
           ) : (
               <>
                 <p className="font-medium text-slate-900">Click to upload Text File</p>
                 <p className="text-sm text-slate-500 mt-1">supports .txt, .md</p>
               </>
           )}
           <p className="text-xs text-slate-400 mt-4">(For PDFs, please copy & paste text below)</p>
        </div>

        {/* Text Area */}
        <div className="relative">
            <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-slate-500">Or paste text directly</span>
            </div>
        </div>

        <div>
             <textarea 
               value={text}
               onChange={(e) => setText(e.target.value)}
               placeholder="Paste your lecture notes here..."
               className="w-full h-40 p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm font-mono"
             />
             <div className="flex justify-between items-center mt-2">
                <button 
                  onClick={() => setText(SAMPLE_TEXT)}
                  className="text-xs text-indigo-600 font-medium hover:underline"
                >
                  Load Sample Text
                </button>
             </div>
        </div>

        {error && (
            <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-100">
                <div className="flex items-start gap-2">
                    <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="font-semibold">{error}</p>
                        {showKeySelector && (
                            <button 
                                onClick={handleChangeKey}
                                className="mt-2 flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded-md text-red-600 text-xs font-bold hover:bg-red-50 transition-colors shadow-sm"
                            >
                                <Key size={12} />
                                Change API Key
                            </button>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* Action Button */}
        <button 
          onClick={handleSimulate}
          disabled={isProcessing}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
             <>
               <Loader2 className="animate-spin" />
               Analyzing Lecture...
             </>
          ) : (
             <>
               <Sparkles className="fill-indigo-400" />
               Generate Study Pack
             </>
          )}
        </button>

      </div>
    </div>
  );
};

export default UploadView;