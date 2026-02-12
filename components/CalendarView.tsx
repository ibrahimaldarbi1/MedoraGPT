import React from 'react';
import { Course } from '../types';
import { ChevronLeft, ChevronRight, GraduationCap } from 'lucide-react';

interface CalendarViewProps {
  courses: Course[];
}

const CalendarView: React.FC<CalendarViewProps> = ({ courses }) => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();
  const monthName = today.toLocaleString('default', { month: 'long' });

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  // Flatten all exams into a single list
  const allExams = courses.flatMap(c => 
      c.exams.map(e => ({
          ...e,
          courseName: c.name,
          color: c.color
      }))
  );

  const renderDays = () => {
    const days = [];
    // Padding for first week
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(<div key={`pad-${i}`} className="h-32 bg-slate-50/50 border border-slate-100"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const daysExams = allExams.filter(e => e.date === dateStr);
        const isToday = day === today.getDate();

        days.push(
            <div key={day} className={`h-32 border border-slate-100 p-2 overflow-hidden hover:bg-slate-50 transition-colors ${isToday ? 'bg-indigo-50/30' : 'bg-white'}`}>
                <div className={`text-sm font-semibold mb-2 ${isToday ? 'text-indigo-600 bg-indigo-100 w-7 h-7 rounded-full flex items-center justify-center' : 'text-slate-700'}`}>
                    {day}
                </div>
                <div className="space-y-1 overflow-y-auto max-h-[80px]">
                    {daysExams.map(exam => (
                        <div key={exam.id} className={`text-xs p-1.5 rounded-md border-l-2 shadow-sm bg-white border-slate-200 truncate`}>
                            <div className="font-bold text-slate-800">{exam.courseName}</div>
                            <div className="text-slate-500">{exam.title}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }
    return days;
  };

  const upcomingExams = allExams
    .filter(e => e.date && new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="p-6 max-w-6xl mx-auto h-full flex flex-col">
       <div className="flex justify-between items-center mb-6">
           <div>
               <h1 className="text-3xl font-bold text-slate-900">Exam Calendar</h1>
               <p className="text-slate-500">{monthName} {currentYear}</p>
           </div>
           
           {/* Simple pagination (visual only for this prototype) */}
           <div className="flex gap-2">
               <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50"><ChevronLeft size={20}/></button>
               <button className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-medium">Today</button>
               <button className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-50 disabled:opacity-50"><ChevronRight size={20}/></button>
           </div>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
           {/* Calendar Grid */}
           <div className="lg:col-span-3 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
               <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
                   {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                       <div key={d} className="py-3 text-center text-xs font-bold text-slate-500 uppercase tracking-wider">{d}</div>
                   ))}
               </div>
               <div className="grid grid-cols-7">
                   {renderDays()}
               </div>
           </div>

           {/* Sidebar List */}
           <div className="space-y-6">
               <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                   <h2 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                       <GraduationCap className="text-indigo-600" size={20} />
                       Upcoming Exams
                   </h2>
                   {upcomingExams.length > 0 ? (
                       <div className="space-y-4">
                           {upcomingExams.map(exam => {
                               const date = new Date(exam.date);
                               const daysLeft = Math.ceil((date.getTime() - today.getTime()) / (1000 * 3600 * 24));
                               return (
                                   <div key={exam.id} className="flex gap-3 items-start p-3 rounded-xl bg-slate-50 border border-slate-100">
                                       <div className={`w-10 h-10 rounded-lg ${exam.color} text-white flex flex-col items-center justify-center flex-shrink-0 shadow-sm`}>
                                           <span className="text-xs font-bold uppercase">{date.toLocaleString('default', { month: 'short' })}</span>
                                           <span className="text-sm font-bold">{date.getDate()}</span>
                                       </div>
                                       <div>
                                           <p className="font-bold text-slate-900 text-sm">{exam.courseName}</p>
                                           <p className="text-xs text-slate-500">{exam.title}</p>
                                           <p className="text-[10px] font-bold text-indigo-600 mt-1">{daysLeft} days away</p>
                                       </div>
                                   </div>
                               )
                           })}
                       </div>
                   ) : (
                       <p className="text-sm text-slate-500">No exams scheduled for the near future.</p>
                   )}
               </div>
           </div>
       </div>
    </div>
  );
};

export default CalendarView;