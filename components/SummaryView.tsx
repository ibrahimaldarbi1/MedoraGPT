import React from 'react';
import ReactMarkdown from 'react-markdown'; // Assuming we had this, but implementing simple render for demo
import { ChevronLeft } from 'lucide-react';

interface SummaryViewProps {
  summary: string;
  title: string;
  onBack: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, title, onBack }) => {
  
  // Simple markdown-ish parser for the demo
  const renderContent = (text: string) => {
    return text.split('\n').map((line, i) => {
        if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-bold text-slate-900 mt-6 mb-4">{line.replace('# ', '')}</h1>;
        if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-800 mt-6 mb-3 border-b border-slate-200 pb-2">{line.replace('## ', '')}</h2>;
        if (line.startsWith('* ') || line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-slate-700 mb-2 pl-2">{line.replace(/[\*\-]\s/, '')}</li>;
        if (line.trim() === '') return <br key={i} />;
        return <p key={i} className="text-slate-600 leading-relaxed mb-4">{line}</p>;
    });
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-sm min-h-screen">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Plan</span>
      </button>

      <div className="prose prose-slate max-w-none">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-8 pb-2">{title}</h1>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-8 text-sm text-yellow-800">
             <strong>AI Summary:</strong> Use this as a quick refresher before diving into flashcards.
          </div>
          <div className="space-y-1">
            {renderContent(summary)}
          </div>
      </div>
    </div>
  );
};

export default SummaryView;