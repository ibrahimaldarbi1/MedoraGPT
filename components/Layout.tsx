import React from 'react';
import { LayoutDashboard, BookOpen, PlusCircle, User, BarChart2, BookMarked } from 'lucide-react';
import { ViewState } from '../types';

interface LayoutProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children }) => {
  const navItems = [
    { view: ViewState.DASHBOARD, icon: LayoutDashboard, label: 'Today' },
    { view: ViewState.COURSES, icon: BookOpen, label: 'Courses' },
    { view: ViewState.UPLOAD, icon: PlusCircle, label: 'Upload' },
    { view: ViewState.ANALYTICS, icon: BarChart2, label: 'Progress' },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-200">
        <div className="p-6 border-b border-slate-100 flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
             <BookMarked className="text-white w-5 h-5" />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">medoraGPT</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all ${
                currentView === item.view
                  ? 'bg-indigo-50 text-indigo-600 font-medium shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100">
           <div className="bg-indigo-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-indigo-600 uppercase mb-1">Exam Countdown</p>
              <p className="text-sm text-indigo-900 font-medium">Anatomy 101</p>
              <p className="text-xs text-indigo-500">5 days remaining</p>
           </div>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 pb-safe">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setView(item.view)}
              className={`flex flex-col items-center p-2 rounded-lg ${
                currentView === item.view ? 'text-indigo-600' : 'text-slate-400'
              }`}
            >
              <item.icon size={24} strokeWidth={currentView === item.view ? 2.5 : 2} />
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