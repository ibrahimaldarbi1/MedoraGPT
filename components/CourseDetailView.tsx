import React, { useState } from 'react';
import { Course, LectureMaterial, MaterialStatus, ViewState } from '../types';
import { ChevronLeft, FileText, Brain, HelpCircle, Plus, Calendar, AlertCircle, Layers, MoreVertical, Edit2, Trash2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CourseDetailViewProps {
  course: Course;
  onBack: () => void;
  onAddMaterial: () => void;
  onStartSession: (courseId: string, materialId: string, mode: ViewState) => void;
  onUpdateMaterial?: (courseId: string, materialId: string, updates: Partial<LectureMaterial>) => void;
  onDeleteMaterial?: (courseId: string, materialId: string) => void;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({ 
  course, 
  onBack, 
  onAddMaterial,
  onStartSession,
  onUpdateMaterial,
  onDeleteMaterial
}) => {
  const navigate = useNavigate();

  // Sort exams by date
  const sortedExams = [...course.exams].sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Group materials by examId (one material can be in multiple groups)
  const materialsByExam: Record<string, LectureMaterial[]> = {};
  const unassignedMaterials: LectureMaterial[] = [];

  course.materials.forEach(mat => {
      const assignedIds = mat.examIds || [];
      if (assignedIds.length > 0) {
          // Check if any assigned IDs are valid exams in this course
          const validAssignments = assignedIds.filter(id => course.exams.some(e => e.id === id));
          
          if (validAssignments.length > 0) {
              validAssignments.forEach(eid => {
                  if (!materialsByExam[eid]) materialsByExam[eid] = [];
                  materialsByExam[eid].push(mat);
              });
          } else {
              unassignedMaterials.push(mat);
          }
      } else {
          unassignedMaterials.push(mat);
      }
  });

  const handleDelete = (id: string) => {
      if (onDeleteMaterial && window.confirm("Are you sure you want to delete this lecture material?")) {
          onDeleteMaterial(course.id, id);
      }
  };

  const renderMaterialCard = (material: LectureMaterial) => (
    <div key={material.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:border-indigo-200 transition-colors mb-3 group">
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
                
                {/* Edit Button */}
                <button 
                  onClick={() => navigate(`/courses/${course.id}/materials/${material.id}/edit`)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-indigo-600 transition-all"
                  title="Edit Material"
                >
                    <Edit2 size={14} />
                </button>
                <button 
                  onClick={() => handleDelete(material.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-600 transition-all"
                  title="Delete Material"
                >
                    <Trash2 size={14} />
                </button>
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
  );

  return (
    <div className="p-6 max-w-5xl mx-auto min-h-screen relative">
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
            </p>
          </div>
          
          <div className="flex gap-2">
             {sortedExams.map(exam => {
                 const diff = exam.date ? Math.ceil((new Date(exam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) : null;
                 if (diff !== null && diff > 0 && diff < 30) {
                     return (
                        <div key={exam.id} className="bg-indigo-50 px-4 py-2 rounded-xl text-center border border-indigo-100">
                            <span className="block text-xl font-bold text-indigo-600">{diff}</span>
                            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wide">Days to {exam.title}</span>
                        </div>
                     )
                 }
                 return null;
             })}
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-900">Study Materials</h2>
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
        <div className="space-y-8">
            {/* Render Exams Sections */}
            {sortedExams.map(exam => {
                const mats = materialsByExam[exam.id];
                if (!mats || mats.length === 0) return null;

                return (
                    <div key={exam.id}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className={`p-2 rounded-lg ${course.color.replace('bg-', 'text-').replace('500', '600')} bg-slate-100`}>
                                <Calendar size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">{exam.title}</h3>
                                <p className="text-sm text-slate-500">{exam.date || 'No Date Set'}</p>
                            </div>
                        </div>
                        {/* Note: Materials can appear multiple times if they are in multiple exams */}
                        {mats.map(renderMaterialCard)}
                    </div>
                )
            })}

            {/* Unassigned Materials */}
            {unassignedMaterials.length > 0 && (
                <div>
                     <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg text-slate-500 bg-slate-100">
                                <Layers size={20} />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 text-lg">General Materials</h3>
                                <p className="text-sm text-slate-500">Not assigned to specific exams</p>
                            </div>
                        </div>
                    {unassignedMaterials.map(renderMaterialCard)}
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default CourseDetailView;