import React from 'react';
import { Course } from '../types';
import { BarChart2, TrendingUp, Clock, BookOpen, AlertTriangle } from 'lucide-react';

interface AnalyticsViewProps {
  courses: Course[];
}

const AnalyticsView: React.FC<AnalyticsViewProps> = ({ courses }) => {
  // Mock aggregations based on existing data
  const totalMaterials = courses.reduce((acc, c) => acc + c.materials.length, 0);
  const totalCards = courses.reduce((acc, c) => acc + c.materials.reduce((mAcc, m) => mAcc + m.flashcards.length, 0), 0);
  const totalQuizzesTaken = courses.reduce((acc, c) => acc + c.materials.reduce((mAcc, m) => mAcc + (m.quizHistory?.length || 0), 0), 0);
  
  // Flatten weak topics
  const allWeakTopics = courses.flatMap(c => c.materials.flatMap(m => m.weakTopics.map(t => ({ topic: t, course: c.name }))));

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Study Progress</h1>
      <p className="text-slate-500 mb-8">Track your retention and activity over time.</p>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><BookOpen size={20}/></div>
               <span className="text-slate-500 text-sm font-medium">Total Materials</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalMaterials}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><TrendingUp size={20}/></div>
               <span className="text-slate-500 text-sm font-medium">Flashcards Created</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalCards}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><BarChart2 size={20}/></div>
               <span className="text-slate-500 text-sm font-medium">Quizzes Taken</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{totalQuizzesTaken}</p>
         </div>
         <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
               <div className="p-2 bg-orange-50 text-orange-600 rounded-lg"><Clock size={20}/></div>
               <span className="text-slate-500 text-sm font-medium">Study Hours</span>
            </div>
            <p className="text-2xl font-bold text-slate-900">4.2h</p> {/* Mock for now */}
         </div>
      </div>

      {/* Weak Areas */}
      <div className="grid md:grid-cols-2 gap-6">
         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
               <AlertTriangle className="text-red-500" size={20} />
               Weak Concepts
            </h2>
            {allWeakTopics.length > 0 ? (
               <ul className="space-y-3">
                  {allWeakTopics.slice(0, 5).map((item, i) => (
                     <li key={i} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100">
                        <div>
                           <p className="font-medium text-slate-800 text-sm">{item.topic}</p>
                           <p className="text-xs text-red-500">{item.course}</p>
                        </div>
                        <button className="text-xs font-bold bg-white text-red-600 px-3 py-1 rounded border border-red-200 hover:bg-red-50">Review</button>
                     </li>
                  ))}
               </ul>
            ) : (
               <div className="text-center py-8 text-slate-400">
                  <p>No weak topics identified yet. Keep studying!</p>
               </div>
            )}
         </div>

         <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <div className="w-32 h-32 rounded-full border-8 border-indigo-100 border-t-indigo-600 flex items-center justify-center mb-4">
               <span className="text-3xl font-bold text-indigo-900">84%</span>
            </div>
            <h3 className="font-bold text-slate-900">Retention Score</h3>
            <p className="text-sm text-slate-500 mt-2">Based on your flashcard performance over the last 7 days.</p>
         </div>
      </div>
    </div>
  );
};

export default AnalyticsView;