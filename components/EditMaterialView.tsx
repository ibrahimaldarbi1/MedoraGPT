import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Course, LectureMaterial, Flashcard, MCQ } from '../types';
import { Save, ArrowLeft, Plus, Trash2, FileText, Brain, HelpCircle, CheckCircle2 } from 'lucide-react';

interface EditMaterialViewProps {
  courses: Course[];
  onUpdate: (courseId: string, materialId: string, updates: Partial<LectureMaterial>) => void;
}

const EditMaterialView: React.FC<EditMaterialViewProps> = ({ courses, onUpdate }) => {
  const { courseId, materialId } = useParams();
  const navigate = useNavigate();

  const course = courses.find(c => c.id === courseId);
  const material = course?.materials.find(m => m.id === materialId);

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [mcqs, setMcqs] = useState<MCQ[]>([]);
  const [activeTab, setActiveTab] = useState<'summary' | 'flashcards' | 'quiz'>('summary');
  const [examIds, setExamIds] = useState<string[]>([]);

  useEffect(() => {
    if (material) {
      setTitle(material.title);
      setSummary(material.summary);
      setFlashcards(JSON.parse(JSON.stringify(material.flashcards)));
      setMcqs(JSON.parse(JSON.stringify(material.mcqs)));
      setExamIds(material.examIds || []);
    }
  }, [material]);

  if (!course || !material) return <div className="p-8 text-center">Material not found</div>;

  const handleSave = () => {
    if (courseId && materialId) {
        onUpdate(courseId, materialId, {
            title,
            summary,
            flashcards,
            mcqs,
            examIds
        });
        navigate(`/courses/${courseId}`);
    }
  };

  const updateFlashcard = (index: number, field: keyof Flashcard, value: string) => {
      const newCards = [...flashcards];
      newCards[index] = { ...newCards[index], [field]: value };
      setFlashcards(newCards);
  };

  const addFlashcard = () => {
      setFlashcards([...flashcards, {
          id: Math.random().toString(36).substr(2, 9),
          front: '',
          back: '',
          difficulty: 'new',
          nextReview: new Date().toISOString()
      }]);
  };

  const removeFlashcard = (index: number) => {
      setFlashcards(flashcards.filter((_, i) => i !== index));
  };

  const updateMcq = (index: number, field: keyof MCQ, value: any) => {
      const newMcqs = [...mcqs];
      newMcqs[index] = { ...newMcqs[index], [field]: value };
      setMcqs(newMcqs);
  };

  const updateMcqOption = (qIndex: number, oIndex: number, value: string) => {
      const newMcqs = [...mcqs];
      const newOptions = [...newMcqs[qIndex].options];
      newOptions[oIndex] = value;
      newMcqs[qIndex].options = newOptions;
      setMcqs(newMcqs);
  };

  const addMcq = () => {
      setMcqs([...mcqs, {
          id: Math.random().toString(36).substr(2, 9),
          question: '',
          options: ['', '', '', ''],
          correctIndex: 0,
          explanation: ''
      }]);
  };

  const removeMcq = (index: number) => {
      setMcqs(mcqs.filter((_, i) => i !== index));
  };

  const toggleExam = (id: string) => {
      if (examIds.includes(id)) {
          setExamIds(examIds.filter(e => e !== id));
      } else {
          setExamIds([...examIds, id]);
      }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
       {/* Top Bar */}
       <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
           <div className="flex items-center gap-4">
               <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                   <ArrowLeft size={20} />
               </button>
               <div>
                   <h1 className="text-lg font-bold text-slate-900">Edit Material</h1>
                   <p className="text-xs text-slate-500">{course.name}</p>
               </div>
           </div>
           <button 
             onClick={handleSave}
             className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold hover:bg-indigo-700 flex items-center gap-2"
           >
               <Save size={18} />
               Save Changes
           </button>
       </div>

       <div className="flex-1 max-w-5xl mx-auto w-full p-6">
           
           {/* Metadata Section */}
           <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-6">
               <div className="grid md:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                       <input 
                         type="text" 
                         value={title}
                         onChange={(e) => setTitle(e.target.value)}
                         className="w-full p-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                       />
                   </div>
                   <div>
                       <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Exams</label>
                       <div className="flex flex-wrap gap-2">
                           {course.exams.map(exam => (
                               <button
                                 key={exam.id}
                                 onClick={() => toggleExam(exam.id)}
                                 className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                                     examIds.includes(exam.id)
                                     ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                                     : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                 }`}
                               >
                                   {exam.title}
                               </button>
                           ))}
                       </div>
                   </div>
               </div>
           </div>

           {/* Tabs */}
           <div className="flex gap-2 mb-6 border-b border-slate-200">
               <button 
                 onClick={() => setActiveTab('summary')}
                 className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                     activeTab === 'summary' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                   <FileText size={18} /> Summary
               </button>
               <button 
                 onClick={() => setActiveTab('flashcards')}
                 className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                     activeTab === 'flashcards' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                   <Brain size={18} /> Flashcards ({flashcards.length})
               </button>
               <button 
                 onClick={() => setActiveTab('quiz')}
                 className={`px-4 py-2 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${
                     activeTab === 'quiz' ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-slate-500 hover:text-slate-700'
                 }`}
               >
                   <HelpCircle size={18} /> Quiz ({mcqs.length})
               </button>
           </div>

           {/* Content Editors */}
           <div className="space-y-6">
               
               {/* SUMMARY EDITOR */}
               {activeTab === 'summary' && (
                   <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                       <label className="block text-sm font-medium text-slate-700 mb-2">Markdown Summary</label>
                       <textarea 
                         value={summary}
                         onChange={(e) => setSummary(e.target.value)}
                         className="w-full h-96 p-4 border border-slate-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                       />
                       <p className="text-xs text-slate-400 mt-2">Supports Markdown formatting (## Headers, *italics*, **bold**, - lists)</p>
                   </div>
               )}

               {/* FLASHCARDS EDITOR */}
               {activeTab === 'flashcards' && (
                   <div className="space-y-4">
                       {flashcards.map((card, index) => (
                           <div key={card.id || index} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group">
                               <button 
                                 onClick={() => removeFlashcard(index)}
                                 className="absolute top-4 right-4 text-slate-300 hover:text-red-500 p-1"
                               >
                                   <Trash2 size={18} />
                               </button>
                               <div className="grid md:grid-cols-2 gap-4 pr-8">
                                   <div>
                                       <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Front</label>
                                       <textarea
                                         value={card.front}
                                         onChange={(e) => updateFlashcard(index, 'front', e.target.value)}
                                         className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                         rows={2}
                                       />
                                   </div>
                                   <div>
                                       <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Back</label>
                                       <textarea
                                         value={card.back}
                                         onChange={(e) => updateFlashcard(index, 'back', e.target.value)}
                                         className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                         rows={2}
                                       />
                                   </div>
                               </div>
                           </div>
                       ))}
                       <button 
                         onClick={addFlashcard}
                         className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                       >
                           <Plus size={20} /> Add Flashcard
                       </button>
                   </div>
               )}

               {/* QUIZ EDITOR */}
               {activeTab === 'quiz' && (
                   <div className="space-y-6">
                       {mcqs.map((mcq, qIndex) => (
                           <div key={mcq.id || qIndex} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm relative">
                               <button 
                                 onClick={() => removeMcq(qIndex)}
                                 className="absolute top-6 right-6 text-slate-300 hover:text-red-500 p-1"
                               >
                                   <Trash2 size={18} />
                               </button>
                               
                               <div className="mb-4 pr-8">
                                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Question</label>
                                   <input
                                     type="text"
                                     value={mcq.question}
                                     onChange={(e) => updateMcq(qIndex, 'question', e.target.value)}
                                     className="w-full p-2 border border-slate-200 rounded-lg font-medium focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                   />
                               </div>

                               <div className="space-y-2 mb-4">
                                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Options (Check the correct one)</label>
                                   {mcq.options.map((opt, oIndex) => (
                                       <div key={oIndex} className="flex items-center gap-3">
                                           <button 
                                              onClick={() => updateMcq(qIndex, 'correctIndex', oIndex)}
                                              className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 ${
                                                  mcq.correctIndex === oIndex ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-slate-300 text-transparent'
                                              }`}
                                           >
                                               <CheckCircle2 size={14} />
                                           </button>
                                           <input
                                             type="text"
                                             value={opt}
                                             onChange={(e) => updateMcqOption(qIndex, oIndex, e.target.value)}
                                             className="flex-1 p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                             placeholder={`Option ${oIndex + 1}`}
                                           />
                                       </div>
                                   ))}
                               </div>

                               <div>
                                   <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Explanation</label>
                                   <textarea
                                     value={mcq.explanation}
                                     onChange={(e) => updateMcq(qIndex, 'explanation', e.target.value)}
                                     className="w-full p-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                                     rows={2}
                                     placeholder="Explain why the answer is correct..."
                                   />
                               </div>
                           </div>
                       ))}
                       <button 
                         onClick={addMcq}
                         className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-medium hover:border-indigo-300 hover:text-indigo-600 transition-colors flex items-center justify-center gap-2"
                       >
                           <Plus size={20} /> Add Question
                       </button>
                   </div>
               )}

           </div>
       </div>
    </div>
  );
};

export default EditMaterialView;