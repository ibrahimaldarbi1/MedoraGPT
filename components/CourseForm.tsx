import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import { X, Check, Calendar } from 'lucide-react';

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

const CourseForm: React.FC<CourseFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [instructor, setInstructor] = useState(initialData?.instructor || '');
  const [examDate, setExamDate] = useState(initialData?.examDate || '');
  const [color, setColor] = useState(initialData?.color || COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    onSave({
      id: initialData?.id, // undefined if new
      name,
      instructor,
      examDate,
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

        {/* Exam Date */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Next Exam Date</label>
          <div className="relative">
            <input
              type="date"
              value={examDate}
              onChange={(e) => setExamDate(e.target.value)}
              className="w-full p-3 pl-10 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <p className="text-xs text-slate-400 mt-1">We'll build your study schedule around this date.</p>
        </div>

        {/* Color Selection */}
        <div>
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