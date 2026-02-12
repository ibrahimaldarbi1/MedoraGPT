import React from 'react';
import { LayoutDashboard, BookOpen, PlusCircle, User, BarChart2, BookMarked, CalendarDays, Flame } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Course } from '../types';
import { useUser } from '../contexts/UserContext';

interface LayoutProps {
  children: React.ReactNode;
  courses: Course[];
}

const Layout: React.FC<LayoutProps> = ({ children, courses }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Today' },
    { path: '/calendar', icon: CalendarDays, label: 'Calendar' },
    { path: '/courses', icon: BookOpen, label: 'Courses' },
    { path: '/upload', icon: PlusCircle, label: 'Upload' },
    { path: '/analytics', icon: BarChart2, label: 'Progress' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  // Find nearest upcoming exam across all courses/exams
  const allExams = courses.flatMap(c => c.exams.map(e => ({ ...e, courseName: c.name })));
  
  const upcomingExam = allExams
    .filter(e => e.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .find(e => new Date(e.date).getTime() >= new Date().setHours(0,0,0,0));

  const daysUntilExam = upcomingExam 
    ? Math.ceil((new Date(upcomingExam.date).getTime() - new Date().getTime()) / (1000 * 3600 * 24)) 
    : 0;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <BookMarked className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-800 tracking-tight">medoraGPT</span>
          </div>
        </div>
        
        {/* Streak Display in Sidebar */}
        <div className="px-6 py-4">
            <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 flex items-center gap-3">
                <div className="bg-white p-2 rounded-full shadow-sm">
                    <Flame className="text-orange-500 fill-orange-500" size={16} />
                </div>
                <div>
                    <p className="text-xs font-bold text-orange-400 uppercase tracking-wide">Current Streak</p>
                    <p className="text-lg font-bold text-slate-900">{user?.streak || 0} Days</p>
                </div>
            </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                isActive(item.path)
                  ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {upcomingExam && (
            <div className="p-4 border-t border-slate-100">
            <div className="bg-indigo-50 rounded-xl p-4">
                <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Exam Countdown</p>
                <p className="text-sm text-indigo-900 font-medium">{upcomingExam.courseName}</p>
                <p className="text-xs text-slate-600 mb-1">{upcomingExam.title}</p>
                <p className="text-xs text-indigo-500 font-bold">{daysUntilExam} days remaining</p>
            </div>
            </div>
        )}
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive(item.path) ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={24} strokeWidth={isActive(item.path) ? 2.5 : 2} />
              <span className="text-[10px] font-medium mt-1">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0 relative">
        {children}
      </main>
    </div>
  );
};

export default Layout;