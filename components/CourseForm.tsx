import React, { useState } from 'react';
import { Course, Exam } from '../types';
import { X, Check, Calendar, Plus, Trash2 } from 'lucide-react';

interface CourseFormProps {
  initialData?: Course | null;
  onSave: (course: Partial<Course>) => void;
  onCancel: () => void;
}

const COLORS = [
  'bg-indigo-500',
  'bg-emerald-500',
  'bg-blue-500',
  'bg-violet-500',
  'bg-rose-500',
  'bg-amber-500',
  'bg-cyan-500',
  'bg-slate-800'
];

type ExamTemplate = 'semester' | 'trimester' | 'custom';

const CourseForm: React.FC<CourseFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [instructor, setInstructor] = useState(initialData?.instructor || '');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);
  const [exams, setExams] = useState<Exam[]>(initialData?.exams || []);
  const [template, setTemplate] = useState<ExamTemplate>('custom');

  const applyTemplate = (type: ExamTemplate) => {
    setTemplate(type);
    const today = new Date().toISOString().split('T')[0];
    const idBase = Math.random().toString(36).substr(2, 5);
    
    if (type === 'semester') {
        setExams([
            { id: `${idBase}-1`, title: 'Midterm Exam', date: '' },
            { id: `${idBase}-2`, title: 'Final Exam', date: '' }
        ]);
    } else if (type === 'trimester') {
        setExams([
            { id: `${idBase}-1`, title: 'First Exam', date: '' },
            { id: `${idBase}-2`, title: 'Second Exam', date: '' },
            { id: `${idBase}-3`, title: 'Final Exam', date: '' }
        ]);
    } else {
        setExams([]);
    }
  };

  const updateExam = (id: string, field: keyof Exam, value: string) => {
      setExams(prev => prev.map(e => e.id === id ? { ...e, [field]: value } : e));
  };

  const addExam = () => {
      setExams(prev => [...prev, { id: Math.random().toString(36).substr(2, 9), title: 'New Exam', date: '' }]);
      setTemplate('custom');
  };

  const removeExam = (id: string) => {
      setExams(prev => prev.filter(e => e.id !== id));
      setTemplate('custom');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({
      id: initialData?.id, // undefined if new
      name,
      instructor,
      exams,
      color,
      materials: initialData?.materials || []
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">
          {initialData ? 'Edit Course' : 'Create New Course'}
        </h1>
        <p className="text-slate-500 mt-2">
          Set up your course details and exam schedule.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
        
        {/* Course Name */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Course Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Molecular Biology"
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            required
          />
        </div>

        {/* Instructor */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Instructor (Optional)</label>
          <input
            type="text"
            value={instructor}
            onChange={(e) => setInstructor(e.target.value)}
            placeholder="e.g. Dr. Roberts"
            className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Exam Schedule */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-medium text-slate-700 mb-3">Exam Structure</label>
          
          {/* Template Buttons */}
          <div className="flex gap-2 mb-4">
              <button 
                type="button"
                onClick={() => applyTemplate('semester')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${template === 'semester' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                  Midterm / Final
              </button>
              <button 
                type="button"
                onClick={() => applyTemplate('trimester')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${template === 'trimester' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                  First / Second / Final
              </button>
              <button 
                type="button"
                onClick={() => setTemplate('custom')}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${template === 'custom' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                  Custom
              </button>
          </div>

          {/* Dynamic Exam List */}
          <div className="space-y-3">
              {exams.map((exam, index) => (
                  <div key={exam.id} className="flex gap-2 items-center">
                      <div className="w-8 h-8 flex items-center justify-center bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                          {index + 1}
                      </div>
                      <input 
                         type="text"
                         value={exam.title}
                         onChange={(e) => updateExam(exam.id, 'title', e.target.value)}
                         placeholder="Exam Title"
                         className="flex-1 p-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <input 
                         type="date"
                         value={exam.date}
                         onChange={(e) => updateExam(exam.id, 'date', e.target.value)}
                         className="w-40 p-2 border border-slate-200 rounded-lg text-sm"
                      />
                      <button 
                        type="button"
                        onClick={() => removeExam(exam.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      >
                          <Trash2 size={16} />
                      </button>
                  </div>
              ))}
          </div>
          
          <button
             type="button"
             onClick={addExam}
             className="mt-4 flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800"
          >
              <Plus size={16} />
              Add Exam
          </button>
        </div>

        {/* Color Selection */}
        <div className="border-t border-slate-100 pt-6">
          <label className="block text-sm font-medium text-slate-700 mb-2">Course Theme</label>
          <div className="flex flex-wrap gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-10 h-10 rounded-full ${c} flex items-center justify-center transition-transform hover:scale-110 ${
                  color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : ''
                }`}
              >
                {color === c && <Check size={16} className="text-white" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 font-medium rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Save Course
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseForm;