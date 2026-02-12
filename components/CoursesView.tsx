import React, { useState } from 'react';
import { Course, ViewState } from '../types';
import { BookOpen, Plus, Search, MoreVertical, Trash2, Edit2, Calendar, FileText } from 'lucide-react';

interface CoursesViewProps {
  courses: Course[];
  onAddCourse: () => void;
  onEditCourse: (course: Course) => void;
  onDeleteCourse: (courseId: string) => void;
  onManageMaterials: (courseId: string) => void;
}

const CoursesView: React.FC<CoursesViewProps> = ({ 
  courses, 
  onAddCourse, 
  onEditCourse, 
  onDeleteCourse,
  onManageMaterials
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredCourses = courses.filter(course => 
    course.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    course.instructor?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Your Courses</h1>
          <p className="text-slate-500 mt-1">Manage your subjects and exam schedules.</p>
        </div>
        
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <input 
              type="text"
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none shadow-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          </div>
          <button 
            onClick={onAddCourse}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm whitespace-nowrap"
          >
            <Plus size={20} />
            Add Course
          </button>
        </div>
      </div>

      {/* Course Grid */}
      {filteredCourses.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map(course => {
            const nextExam = course.exams
                ?.filter(e => e.date && new Date(e.date).getTime() >= new Date().setHours(0,0,0,0))
                ?.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
            
            return (
            <div key={course.id} className="group bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col overflow-hidden relative">
              
              {/* Card Color Header */}
              <div className={`h-3 w-full ${course.color}`} />
              
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 rounded-xl ${course.color} bg-opacity-10 flex items-center justify-center`}>
                     <BookOpen className={`${course.color.replace('bg-', 'text-')}`} size={24} />
                  </div>
                  
                  {/* Actions Dropdown/Row */}
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => onEditCourse(course)}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      title="Edit Course"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmId(course.id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-1 leading-tight">{course.name}</h3>
                {course.instructor && <p className="text-slate-500 text-sm mb-4">{course.instructor}</p>}

                <div className="mt-auto space-y-3 pt-4 border-t border-slate-50">
                  <div className="flex items-center text-sm text-slate-600">
                    <Calendar size={16} className="mr-2 text-slate-400" />
                    <span>Next Exam: <span className="font-medium text-slate-900">{nextExam ? `${nextExam.title} (${nextExam.date})` : 'Not Scheduled'}</span></span>
                  </div>
                  <div className="flex items-center text-sm text-slate-600">
                    <FileText size={16} className="mr-2 text-slate-400" />
                    <span><span className="font-medium text-slate-900">{course.materials.length}</span> lectures uploaded</span>
                  </div>
                </div>

                <button 
                  onClick={() => onManageMaterials(course.id)}
                  className="mt-5 w-full py-2.5 bg-slate-50 text-indigo-600 font-semibold text-sm rounded-lg hover:bg-indigo-50 transition-colors border border-slate-100 group-hover:border-indigo-100"
                >
                  View Study Materials
                </button>
              </div>

              {/* Delete Confirmation Overlay */}
              {deleteConfirmId === course.id && (
                <div className="absolute inset-0 bg-white/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-200">
                  <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-3">
                    <Trash2 size={24} />
                  </div>
                  <h4 className="font-bold text-slate-900 mb-1">Delete Course?</h4>
                  <p className="text-sm text-slate-500 mb-4">This will permanently remove "{course.name}" and all its materials.</p>
                  <div className="flex gap-2 w-full">
                    <button 
                      onClick={() => setDeleteConfirmId(null)}
                      className="flex-1 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => {
                        onDeleteCourse(course.id);
                        setDeleteConfirmId(null);
                      }}
                      className="flex-1 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}

            </div>
          )})}
        </div>
      ) : (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
           <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-slate-400">
             <Search size={32} />
           </div>
           <h3 className="text-lg font-bold text-slate-900">No courses found</h3>
           <p className="text-slate-500 mb-6">Try adjusting your search or add a new course.</p>
           <button 
             onClick={onAddCourse}
             className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700"
           >
             Create New Course
           </button>
        </div>
      )}
    </div>
  );
};

export default CoursesView;