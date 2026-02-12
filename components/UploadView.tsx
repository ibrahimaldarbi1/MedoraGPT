import React, { useState, useEffect } from 'react';
import { Upload, FileText, Loader2, Sparkles, AlertCircle, Key, File as FileIcon } from 'lucide-react';
import { Course } from '../types';
import { SAMPLE_TEXT } from '../constants';
import * as pdfjsLib from 'pdfjs-dist';

// Handle esm.sh export structure which might put the library on .default
const pdf = (pdfjsLib as any).default || pdfjsLib;

// Configure worker with a stable CDN URL
if (pdf.GlobalWorkerOptions) {
  pdf.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
}

interface UploadViewProps {
  courses: Course[];
  onUpload: (courseId: string, title: string, text: string) => Promise<void>;
  preSelectedCourseId?: string | null;
}

const UploadView: React.FC<UploadViewProps> = ({ courses, onUpload, preSelectedCourseId }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>(preSelectedCourseId || courses[0]?.id || '');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!title) {
        setError("Please enter a lecture title.");
        return;
    }
    setError(null);
    setIsProcessing(true);
    try {
        await onUpload(selectedCourse, title, text || SAMPLE_TEXT);
    } catch (e: any) {
        console.error(e);
        const msg = e.toString();
        if (msg.includes("404") || msg.includes("not found")) {
             setError("API Error: Model not found or API key invalid.");
        } else {
            setError("Failed to generate study pack. " + (e.message || "Please check your connection."));
        }
    } finally {
        setIsProcessing(false);
    }
  };

  const extractTextFromPDF = async (file: File) => {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Use resolved pdf object
      const loadingTask = pdf.getDocument({ data: arrayBuffer });
      const pdfDoc = await loadingTask.promise;
      let fullText = '';
      
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const page = await pdfDoc.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: any) => item.str).join(' ');
        fullText += pageText + '\n\n';
      }
      return fullText;
    } catch (err) {
      console.error("PDF Parse Error", err);
      throw new Error("Could not parse PDF. Please try a different file or copy text manually.");
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setError(null);
      setFileName(file.name);
      if (!title) {
          setTitle(file.name.replace(/\.[^/.]+$/, ""));
      }

      try {
        if (file.type === 'application/pdf') {
          const extracted = await extractTextFromPDF(file);
          setText(extracted);
        } else if (file.type === 'text/plain' || file.name.endsWith('.md') || file.name.endsWith('.txt')) {
          const reader = new FileReader();
          reader.onload = (event) => {
              setText(event.target?.result as string);
          };
          reader.readAsText(file);
        } else {
          setError("Unsupported file type. Please use PDF, TXT, or MD.");
        }
      } catch (err: any) {
        setError(err.message);
      }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Upload Material</h1>
        <p className="text-slate-500 mt-2">Turn your lecture notes or PDFs into a study system in seconds.</p>
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
              accept=".txt,.md,.pdf"
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
                 <p className="font-medium text-slate-900">Click to upload PDF or Text</p>
                 <p className="text-sm text-slate-500 mt-1">supports .pdf, .txt, .md</p>
               </>
           )}
           <p className="text-xs text-slate-400 mt-4">(PDFs are processed locally in your browser)</p>
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
               placeholder="Extracted text will appear here..."
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