import React from 'react';
import { ViewState, Course, MaterialStatus } from '../types';
import { Calendar, Brain, CheckCircle2, ArrowRight, Clock, GraduationCap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardStats {
    dueReviews: string;
    mastered: string;
    studyHours: string;
    retention: string;
}

interface DashboardProps {
  courses: Course[];
  stats: DashboardStats;
  onStartSession: (courseId: string, materialId: string, mode: ViewState) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ courses, stats, onStartSession }) => {
  const navigate = useNavigate();

  // Logic to find "Due" items
  const activeCourse = courses.find(c => c.materials.some(m => m.status === MaterialStatus.READY));
  const readyMaterial = activeCourse?.materials.find(m => m.status === MaterialStatus.READY);

  // Logic for nearest upcoming exam
  const upcomingExam = courses
    .filter(c => c.examDate)
    .sort((a, b) => new Date(a.examDate!).getTime() - new Date(b.examDate!).getTime())
    .find(c => new Date(c.examDate!).getTime() >= new Date().setHours(0,0,0,0));

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const daysUntilExam = upcomingExam ? getDaysUntil(upcomingExam.examDate) : 0;
  
  // Collect all weak topics
  const weakTopicsList = courses.flatMap(c => 
    c.materials.flatMap(m => 
      m.weakTopics.map(topic => ({ topic, materialId: m.id, courseId: c.id, courseName: c.name }))
    )
  ).slice(0, 3);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, Student</h1>
          <p className="text-slate-500">You have {stats.dueReviews} cards due for review today.</p>
        </div>
        <div className="flex items-center gap-3">
            {/* Exam Countdown Pill */}
            {upcomingExam && (
                <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                    <GraduationCap size={16} />
                    <span>{upcomingExam.name} Exam: {daysUntilExam} days</span>
                </div>
            )}
            
            {/* Streak Pill */}
            <div className="flex items-center space-x-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium border border-orange-100">
            <span role="img" aria-label="fire">🔥</span>
            <span>12 Day Streak</span>
            </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Due Reviews', value: stats.dueReviews, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Mastered', value: stats.mastered, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Study Time', value: stats.studyHours, icon: Calendar, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Retention', value: stats.retention, icon: Brain, color: 'text-pink-600', bg: 'bg-pink-50' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={20} />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Today's Smart Plan */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-600" />
          Today's Smart Plan
        </h2>
        
        {readyMaterial && activeCourse ? (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 relative overflow-hidden group hover:border-indigo-200 transition-colors">
            <div className={`absolute top-0 left-0 w-2 h-full ${activeCourse.color}`}></div>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pl-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{activeCourse.name}</span>
                  <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                  <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Exam: {activeCourse.examDate || 'No date'}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{readyMaterial.title}</h3>
                <div className="flex flex-wrap gap-2">
                    {readyMaterial.topics.slice(0,3).map(t => (
                        <span key={t} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">{t}</span>
                    ))}
                </div>
              </div>

              <div className="flex items-center gap-3">
                 <button 
                    onClick={() => onStartSession(activeCourse.id, readyMaterial.id, ViewState.STUDY_SUMMARY)}
                    className="flex-1 md:flex-none px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
                 >
                    Review Summary
                 </button>
                 <button 
                    onClick={() => onStartSession(activeCourse.id, readyMaterial.id, ViewState.STUDY_FLASHCARDS)}
                    className="flex-1 md:flex-none px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                 >
                    <Brain size={16} />
                    Start Flashcards
                 </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center p-12 bg-white rounded-2xl border border-dashed border-slate-300">
             <p className="text-slate-500 mb-4">No plan for today. Upload a lecture to get started!</p>
             <button onClick={() => navigate('/upload')} className="text-indigo-600 font-medium hover:underline">Upload Lecture PDF</button>
          </div>
        )}
      </div>

      {/* Recent Activity / Weak Spots */}
      <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <h3 className="font-bold text-slate-900 mb-4">Weak Concepts (Prioritized)</h3>
             {weakTopicsList.length > 0 ? (
                 <ul className="space-y-3">
                     {weakTopicsList.map((wt, i) => (
                        <li key={i} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-100">
                           <div>
                               <span className="text-sm font-medium text-slate-800 block">{wt.topic}</span>
                               <span className="text-xs text-red-400">{wt.courseName}</span>
                           </div>
                           <button 
                             onClick={() => onStartSession(wt.courseId, wt.materialId, ViewState.STUDY_FLASHCARDS)}
                             className="text-xs font-bold text-red-600 hover:underline"
                           >
                             Drill Now
                           </button>
                        </li>
                     ))}
                 </ul>
             ) : (
                 <div className="text-center py-6 text-slate-400 text-sm">
                     No weak concepts identified yet. Great job!
                 </div>
             )}
          </div>

          <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl shadow-lg text-white">
              <h3 className="font-bold text-lg mb-2">Pro Tip</h3>
              <p className="text-indigo-200 text-sm leading-relaxed mb-4">
                  Students who use spaced repetition for 15 minutes a day retain 80% more information than those who cram.
              </p>
              <div className="w-full bg-white/10 rounded-full h-2">
                  <div className="bg-indigo-400 h-2 rounded-full w-3/4"></div>
              </div>
              <p className="text-xs text-indigo-300 mt-2 text-right">Weekly Goal: 75% complete</p>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;