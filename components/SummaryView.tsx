import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SummaryViewProps {
  summary: string;
  title: string;
  onBack: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ summary, title, onBack }) => {
  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-sm min-h-screen">
      <button onClick={onBack} className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
          <ChevronLeft size={20} />
          <span className="font-medium">Back to Plan</span>
      </button>

      <article className="prose prose-slate max-w-none prose-headings:text-slate-900 prose-p:text-slate-600 prose-li:text-slate-600">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600 mb-8 pb-2">{title}</h1>
          <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400 mb-8 text-sm text-yellow-800 not-prose">
             <strong>AI Summary:</strong> Use this as a quick refresher before diving into flashcards.
          </div>
          <ReactMarkdown>{summary}</ReactMarkdown>
      </article>
    </div>
  );
};

export default SummaryView;