import React from 'react';
import { Course, MaterialStatus, ViewState } from '../types';
import { ChevronLeft, FileText, Brain, HelpCircle, Plus, Calendar, AlertCircle } from 'lucide-react';

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  onAddMaterial: () => void;
  onStartSession: (courseId: string, materialId: string, mode: ViewState) => void;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({ 
  course, 
  onBack, 
  onAddMaterial,
  onStartSession 
}) => {

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return null;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const daysUntil = getDaysUntil(course.examDate);

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen">
      <button 
        onClick={onBack}
        className="flex items-center text-slate-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <ChevronLeft size={20} />
        <span className="font-medium">Back to Courses</span>
      </button>

      {/* Header */}
      <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm mb-8 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${course.color}`} />
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{course.name}</h1>
            <p className="text-slate-500 flex items-center gap-2">
              <span className="font-medium">{course.instructor}</span>
              {course.instructor && <span>•</span>}
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                Next Exam: {course.examDate || 'Not Scheduled'}
              </span>
            </p>
          </div>
          
          {daysUntil !== null && (
             <div className="bg-indigo-50 px-4 py-2 rounded-xl text-center">
                <span className="block text-2xl font-bold text-indigo-600">{daysUntil}</span>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wide">Days Left</span>
             </div>
          )}
        </div>
      </div>

      {/* Materials List */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Lecture Materials</h2>
        <button 
          onClick={onAddMaterial}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Upload Lecture
        </button>
      </div>

      {course.materials.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
           <FileText className="mx-auto text-slate-300 mb-3" size={48} />
           <p className="text-slate-500 font-medium">No materials uploaded yet.</p>
           <p className="text-slate-400 text-sm mb-4">Upload a PDF or notes to get started.</p>
           <button 
             onClick={onAddMaterial}
             className="text-indigo-600 hover:underline font-medium"
           >
             Upload First Lecture
           </button>
        </div>
      ) : (
        <div className="space-y-4">
          {course.materials.map(material => (
            <div key={material.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                     <h3 className="text-lg font-bold text-slate-900">{material.title}</h3>
                     {material.status === MaterialStatus.PROCESSING && (
                        <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-[10px] font-bold uppercase rounded-full">Processing</span>
                     )}
                     {material.status === MaterialStatus.ERROR && (
                        <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold uppercase rounded-full flex items-center gap-1">
                          <AlertCircle size={10} /> Error
                        </span>
                     )}
                  </div>
                  <p className="text-sm text-slate-500">Added {material.dateAdded} • {material.topics.length} topics</p>
                  {material.quizHistory && material.quizHistory.length > 0 && (
                     <p className="text-xs text-emerald-600 mt-2 font-medium">
                        Best Quiz Score: {Math.max(...material.quizHistory.map(h => (h.score / h.total) * 100)).toFixed(0)}%
                     </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                   {material.status === MaterialStatus.READY && (
                     <>
                        <button 
                          onClick={() => onStartSession(course.id, material.id, ViewState.STUDY_SUMMARY)}
                          className="px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <FileText size={16} /> Summary
                        </button>
                        <button 
                          onClick={() => onStartSession(course.id, material.id, ViewState.STUDY_FLASHCARDS)}
                          className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <Brain size={16} /> Flashcards
                        </button>
                        <button 
                          onClick={() => onStartSession(course.id, material.id, ViewState.STUDY_QUIZ)}
                          className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
                        >
                          <HelpCircle size={16} /> Quiz
                        </button>
                     </>
                   )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseDetailView;