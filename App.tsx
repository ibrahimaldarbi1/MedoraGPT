import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UploadView from './components/UploadView';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';
import CoursesView from './components/CoursesView';
import CourseForm from './components/CourseForm';
import { ViewState, Course, LectureMaterial, MaterialStatus } from './types';
import { MOCK_COURSES } from './constants';
import { generateStudyPack } from './services/geminiService';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  
  // Active session state
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  
  // Edit State
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Helper to get active material
  const getActiveData = () => {
    const course = courses.find(c => c.id === activeCourseId);
    const material = course?.materials.find(m => m.id === activeMaterialId);
    return { course, material };
  };

  const handleStartSession = (courseId: string, materialId: string, mode: ViewState) => {
    setActiveCourseId(courseId);
    setActiveMaterialId(materialId);
    setCurrentView(mode);
  };

  const handleAddCourse = () => {
    setCourseToEdit(null);
    setCurrentView(ViewState.MANAGE_COURSE);
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    setCurrentView(ViewState.MANAGE_COURSE);
  };

  const handleSaveCourse = (courseData: Partial<Course>) => {
    if (courseData.id) {
        // Edit existing
        setCourses(prev => prev.map(c => c.id === courseData.id ? { ...c, ...courseData } as Course : c));
    } else {
        // Add new
        const newCourse: Course = {
            id: Math.random().toString(36).substr(2, 9),
            name: courseData.name || 'New Course',
            instructor: courseData.instructor || '',
            examDate: courseData.examDate || '',
            color: courseData.color || 'bg-indigo-500',
            materials: []
        };
        setCourses(prev => [...prev, newCourse]);
    }
    setCurrentView(ViewState.COURSES);
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (activeCourseId === courseId) {
        setActiveCourseId(null);
    }
  };

  const handleManageMaterials = (courseId: string) => {
      // In MVP, maybe just go to upload or handle detail view. 
      // For now, let's assume it goes to Upload with that course selected default
      // Or we can just keep them on courses view, but the prompt implies management.
      // Re-using UPLOAD for now as an entry point or DASHBOARD
      // Ideally we'd have a COURSE_DETAIL view.
      // Let's go to Upload for now so they can add stuff.
      setActiveCourseId(courseId); // Set default for upload picker
      setCurrentView(ViewState.UPLOAD);
  };

  const handleUpload = async (courseId: string, title: string, text: string) => {
    const newMaterialId = Math.random().toString(36).substr(2, 9);
    try {
      // 1. Create a placeholder material
      const placeholder: LectureMaterial = {
          id: newMaterialId,
          title: title,
          dateAdded: new Date().toISOString().split('T')[0],
          status: MaterialStatus.PROCESSING,
          summary: '',
          flashcards: [],
          mcqs: [],
          topics: [],
          weakTopics: []
      };

      setCourses(prev => prev.map(c => {
          if (c.id === courseId) {
              return { ...c, materials: [placeholder, ...c.materials] };
          }
          return c;
      }));
      
      setCurrentView(ViewState.DASHBOARD);

      // 2. Call Gemini API
      const result = await generateStudyPack(text);

      // 3. Update material with result
      setCourses(prev => prev.map(c => {
          if (c.id === courseId) {
              return { 
                  ...c, 
                  materials: c.materials.map(m => {
                      if (m.id === newMaterialId) {
                          return {
                              ...m,
                              status: MaterialStatus.READY,
                              summary: result.summary,
                              flashcards: result.flashcards.map((f, i) => ({
                                  id: `${newMaterialId}-f${i}`,
                                  front: f.front,
                                  back: f.back,
                                  difficulty: 'new',
                                  nextReview: new Date().toISOString()
                              })),
                              mcqs: result.mcqs.map((q, i) => ({
                                  id: `${newMaterialId}-q${i}`,
                                  ...q
                              })),
                              topics: result.topics
                          };
                      }
                      return m;
                  })
              };
          }
          return c;
      }));

    } catch (error) {
       console.error("Upload failed", error);
       // Update the material status to error
       setCourses(prev => prev.map(c => {
          if (c.id === courseId) {
              return { 
                  ...c, 
                  materials: c.materials.map(m => m.id === newMaterialId ? { ...m, status: MaterialStatus.ERROR } : m)
              };
          }
          return c;
       }));
       throw error;
    }
  };

  const renderContent = () => {
    const { material } = getActiveData();

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard courses={courses} onStartSession={handleStartSession} setView={setCurrentView} />;
      
      case ViewState.UPLOAD:
        return <UploadView courses={courses} onUpload={handleUpload} />;
      
      case ViewState.STUDY_FLASHCARDS:
        return material ? (
            <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className="text-slate-500 hover:text-indigo-600 font-medium">Close</button>
                    <h2 className="font-bold text-slate-800">{material.title}</h2>
                    <div className="w-10"></div>
                </div>
                <FlashcardView cards={material.flashcards} onComplete={() => setCurrentView(ViewState.DASHBOARD)} />
            </div>
        ) : <div>Error: Material not found</div>;

      case ViewState.STUDY_QUIZ:
        return material ? (
             <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <button onClick={() => setCurrentView(ViewState.DASHBOARD)} className="text-slate-500 hover:text-indigo-600 font-medium">Exit Quiz</button>
                    <h2 className="font-bold text-slate-800">Quiz: {material.title}</h2>
                    <div className="w-10"></div>
                </div>
                <QuizView questions={material.mcqs} onComplete={() => setCurrentView(ViewState.DASHBOARD)} />
            </div>
        ) : <div>Error: Material not found</div>;

      case ViewState.STUDY_SUMMARY:
         return material ? (
             <SummaryView summary={material.summary} title={material.title} onBack={() => setCurrentView(ViewState.DASHBOARD)} />
         ) : <div>Error</div>;

      case ViewState.COURSES:
          return (
              <CoursesView 
                courses={courses} 
                onAddCourse={handleAddCourse}
                onEditCourse={handleEditCourse}
                onDeleteCourse={handleDeleteCourse}
                onManageMaterials={handleManageMaterials}
              />
          );

      case ViewState.MANAGE_COURSE:
          return (
            <CourseForm 
              initialData={courseToEdit} 
              onSave={handleSaveCourse} 
              onCancel={() => setCurrentView(ViewState.COURSES)} 
            />
          );

      default:
        return <div className="p-10 text-center">View Not Implemented</div>;
    }
  };

  return (
    <Layout currentView={currentView} setView={setCurrentView}>
      {renderContent()}
    </Layout>
  );
};

export default App;