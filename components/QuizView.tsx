import React, { useState } from 'react';
import { MCQ } from '../types';
import { CheckCircle2, XCircle, ChevronRight, HelpCircle } from 'lucide-react';

interface QuizViewProps {
  questions: MCQ[];
  onComplete: () => void;
}

const QuizView: React.FC<QuizViewProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  if (!questions || questions.length === 0) {
      return <div className="p-8 text-center text-slate-500">No questions available.</div>;
  }

  const currentQ = questions[currentIndex];

  const handleSubmit = () => {
    if (selectedOption === null) return;
    setIsSubmitted(true);
    if (selectedOption === currentQ.correctIndex) {
        setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedOption(null);
        setIsSubmitted(false);
    } else {
        onComplete();
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
       <div className="flex justify-between items-center mb-6">
           <span className="text-sm font-bold text-slate-400">Question {currentIndex + 1} of {questions.length}</span>
           <span className="text-sm font-bold text-indigo-600">Score: {score}</span>
       </div>

       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 mb-6">
           <h3 className="text-lg font-bold text-slate-900 mb-6">{currentQ.question}</h3>
           
           <div className="space-y-3">
               {currentQ.options.map((option, idx) => {
                   let buttonStyle = "border-slate-200 hover:bg-slate-50";
                   if (isSubmitted) {
                       if (idx === currentQ.correctIndex) buttonStyle = "bg-emerald-50 border-emerald-500 text-emerald-800 ring-1 ring-emerald-500";
                       else if (idx === selectedOption) buttonStyle = "bg-red-50 border-red-500 text-red-800 ring-1 ring-red-500";
                   } else if (selectedOption === idx) {
                       buttonStyle = "bg-indigo-50 border-indigo-500 text-indigo-800 ring-1 ring-indigo-500";
                   }

                   return (
                       <button
                         key={idx}
                         disabled={isSubmitted}
                         onClick={() => setSelectedOption(idx)}
                         className={`w-full text-left p-4 rounded-xl border-2 transition-all flex justify-between items-center ${buttonStyle}`}
                       >
                         <span>{option}</span>
                         {isSubmitted && idx === currentQ.correctIndex && <CheckCircle2 size={20} className="text-emerald-600" />}
                         {isSubmitted && idx === selectedOption && idx !== currentQ.correctIndex && <XCircle size={20} className="text-red-600" />}
                       </button>
                   )
               })}
           </div>
       </div>

       {isSubmitted && (
           <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex gap-3">
               <HelpCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
               <div>
                   <h4 className="font-bold text-blue-900 text-sm mb-1">Explanation</h4>
                   <p className="text-blue-800 text-sm">{currentQ.explanation}</p>
               </div>
           </div>
       )}

       <div className="flex justify-end">
           {!isSubmitted ? (
               <button 
                 onClick={handleSubmit}
                 disabled={selectedOption === null}
                 className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
               >
                   Submit Answer
               </button>
           ) : (
               <button 
                 onClick={handleNext}
                 className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
               >
                   {currentIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                   <ChevronRight size={18} />
               </button>
           )}
       </div>
    </div>
  );
};

export default QuizView;