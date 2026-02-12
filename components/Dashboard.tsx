import React from 'react';
import { ViewState, Course, MaterialStatus } from '../types';
import { Calendar, Brain, CheckCircle2, ArrowRight, Clock, GraduationCap, Trophy, Scroll, Upload, Layers, Award, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

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
  const { user, getLevelInfo } = useUser();
  const levelInfo = getLevelInfo();

  // Logic to find "Due" items
  const activeCourse = courses.find(c => c.materials.some(m => m.status === MaterialStatus.READY));
  const readyMaterial = activeCourse?.materials.find(m => m.status === MaterialStatus.READY);

  // Logic for nearest upcoming exam (Look through all exams in all courses)
  const allExams = courses.flatMap(c => c.exams.map(e => ({...e, courseName: c.name})));
  
  const upcomingExam = allExams
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0));

  const getDaysUntil = (dateStr?: string) => {
    if (!dateStr) return 0;
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 3600 * 24));
  };

  const daysUntilExam = upcomingExam ? getDaysUntil(upcomingExam.date) : 0;
  
  // Collect all weak topics
  const weakTopicsList = courses.flatMap(c => 
    c.materials.flatMap(m => 
      m.weakTopics.map(topic => ({ topic, materialId: m.id, courseId: c.id, courseName: c.name }))
    )
  ).slice(0, 3);

  // Icon mapper for quests
  const getQuestIcon = (iconName: string) => {
      switch(iconName) {
          case 'Brain': return <Brain size={18} />;
          case 'Layers': return <Layers size={18} />;
          case 'Award': return <Award size={18} />;
          case 'Upload': return <Upload size={18} />;
          case 'Star': return <Star size={18} />;
          default: return <CheckCircle2 size={18} />;
      }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Good Morning, {user?.name?.split(' ')[0] || 'Student'}</h1>
          <div className="flex items-center gap-2 mt-1">
              <span className="text-slate-500">Level {levelInfo.level} {levelInfo.title}</span>
              <span className="text-slate-300">•</span>
              <span className="text-indigo-600 font-bold text-sm">{user?.xp || 0} XP</span>
          </div>
          {/* XP Progress Bar */}
          <div className="mt-2 w-48 h-2 bg-slate-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
          </div>
        </div>
        <div className="flex items-center gap-3">
            {/* Exam Countdown Pill */}
            {upcomingExam && (
                <div className="flex items-center space-x-2 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium border border-indigo-100">
                    <GraduationCap size={16} />
                    <span>{upcomingExam.courseName} - {upcomingExam.title}: {daysUntilExam} days</span>
                </div>
            )}
            
            {/* Streak Pill */}
            <div className="flex items-center space-x-2 bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-sm font-medium border border-orange-100">
            <span role="img" aria-label="fire">🔥</span>
            <span>{user?.streak || 0} Day Streak</span>
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

      <div className="grid md:grid-cols-3 gap-6">
        {/* Today's Smart Plan */}
        <div className="md:col-span-2">
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
                    {upcomingExam && upcomingExam.courseName === activeCourse.name && (
                        <span className="text-xs font-medium text-red-500 bg-red-50 px-2 py-0.5 rounded-full">{upcomingExam.title}: {upcomingExam.date}</span>
                    )}
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

        {/* Quest Log Widget */}
        <div>
            <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Scroll className="w-5 h-5 text-amber-600" />
                Daily Quests
            </h2>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 space-y-3">
                {user?.dailyQuests.map((quest) => (
                    <div key={quest.id} className={`p-3 rounded-xl border transition-colors ${quest.completed ? 'bg-green-50 border-green-200' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${quest.completed ? 'bg-green-100 text-green-700' : 'bg-white text-indigo-600 shadow-sm'}`}>
                                    {getQuestIcon(quest.icon)}
                                </div>
                                <span className={`text-sm font-bold ${quest.completed ? 'text-green-800' : 'text-slate-700'}`}>
                                    {quest.description}
                                </span>
                            </div>
                            {quest.completed && <CheckCircle2 size={18} className="text-green-600" />}
                        </div>
                        
                        {!quest.completed && (
                            <div className="space-y-1">
                                <div className="flex justify-between text-xs text-slate-500">
                                    <span>{quest.progress} / {quest.target}</span>
                                    <span className="font-bold text-amber-500">+{quest.xpReward} XP</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-1.5">
                                    <div 
                                        className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
                                        style={{ width: `${Math.min(100, (quest.progress / quest.target) * 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}
                        {quest.completed && (
                             <div className="text-right text-xs font-bold text-green-600">
                                 Completed! (+{quest.xpReward} XP)
                             </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
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
              <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold text-lg">Current Level</h3>
                 <Trophy className="text-yellow-400" size={20} />
              </div>
              <p className="text-3xl font-bold text-white mb-1">{levelInfo.title}</p>
              <p className="text-indigo-200 text-sm mb-4">
                  {Math.round(levelInfo.max - levelInfo.current)} XP until next level
              </p>
              
              <div className="w-full bg-white/10 rounded-full h-3 mb-2">
                  <div className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full" style={{ width: `${levelInfo.progress}%` }}></div>
              </div>
              <p className="text-xs text-indigo-300 text-right">{Math.round(levelInfo.progress)}% Complete</p>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;