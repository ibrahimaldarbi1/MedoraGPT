import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import UploadView from './components/UploadView';
import FlashcardView from './components/FlashcardView';
import QuizView from './components/QuizView';
import SummaryView from './components/SummaryView';
import CoursesView from './components/CoursesView';
import CourseForm from './components/CourseForm';
import CourseDetailView from './components/CourseDetailView';
import AnalyticsView from './components/AnalyticsView';
import ProfileView from './components/ProfileView';
import { ViewState, Course, LectureMaterial, MaterialStatus } from './types';
import { MOCK_COURSES } from './constants';
import { generateStudyPack } from './services/geminiService';

const STORAGE_KEY = 'medoraGPT_courses_v1';

const App: React.FC = () => {
  // Load initial state from local storage or mock
  const [courses, setCourses] = useState<Course[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : MOCK_COURSES;
    } catch (e) {
      console.error("Failed to load state", e);
      return MOCK_COURSES;
    }
  });

  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  
  // Active session state
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  
  // Edit State
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

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
      setActiveCourseId(courseId);
      setCurrentView(ViewState.COURSE_DETAIL);
  };

  // SM-2 Spaced Repetition Logic Implementation
  const handleCardRating = (cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
      setCourses(prevCourses => {
          return prevCourses.map(course => {
              if (course.id !== activeCourseId) return course;
              return {
                  ...course,
                  materials: course.materials.map(mat => {
                      if (mat.id !== activeMaterialId) return mat;
                      return {
                          ...mat,
                          flashcards: mat.flashcards.map(card => {
                              if (card.id !== cardId) return card;

                              // Algorithm parameters
                              let interval = card.interval || 0;
                              let ease = card.easeFactor || 2.5;
                              let repetitions = card.repetitions || 0;

                              if (rating === 'again') {
                                  repetitions = 0;
                                  interval = 1; // 1 day
                              } else {
                                  // Simplified SM-2
                                  if (repetitions === 0) {
                                      interval = 1;
                                  } else if (repetitions === 1) {
                                      interval = 6;
                                  } else {
                                      interval = Math.ceil(interval * ease);
                                  }
                                  repetitions++;
                              }

                              // Adjust Ease
                              if (rating === 'hard') ease = Math.max(1.3, ease - 0.2);
                              if (rating === 'easy') ease += 0.15;

                              // Calculate next date
                              const nextDate = new Date();
                              nextDate.setDate(nextDate.getDate() + interval);

                              return {
                                  ...card,
                                  difficulty: rating === 'again' ? 'learning' : rating === 'easy' ? 'mastered' : 'review',
                                  nextReview: nextDate.toISOString(),
                                  interval,
                                  easeFactor: ease,
                                  repetitions
                              };
                          })
                      };
                  })
              };
          });
      });
  };

  const handleQuizComplete = (score: number, total: number) => {
      setCourses(prevCourses => {
          return prevCourses.map(course => {
              if (course.id !== activeCourseId) return course;
              return {
                  ...course,
                  materials: course.materials.map(mat => {
                      if (mat.id !== activeMaterialId) return mat;
                      const history = mat.quizHistory || [];
                      return {
                          ...mat,
                          quizHistory: [...history, { date: new Date().toISOString(), score, total }]
                      };
                  })
              };
          });
      });
      setCurrentView(ViewState.COURSE_DETAIL);
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
    const { course, material } = getActiveData();

    switch (currentView) {
      case ViewState.DASHBOARD:
        return <Dashboard courses={courses} onStartSession={handleStartSession} setView={setCurrentView} />;
      
      case ViewState.UPLOAD:
        return <UploadView courses={courses} onUpload={handleUpload} />;
      
      case ViewState.STUDY_FLASHCARDS:
        return material ? (
            <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <button onClick={() => setCurrentView(ViewState.COURSE_DETAIL)} className="text-slate-500 hover:text-indigo-600 font-medium">Close</button>
                    <h2 className="font-bold text-slate-800">{material.title}</h2>
                    <div className="w-10"></div>
                </div>
                <FlashcardView 
                   cards={material.flashcards} 
                   onRateCard={handleCardRating}
                   onComplete={() => setCurrentView(ViewState.COURSE_DETAIL)} 
                />
            </div>
        ) : <div>Error: Material not found</div>;

      case ViewState.STUDY_QUIZ:
        return material ? (
             <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <button onClick={() => setCurrentView(ViewState.COURSE_DETAIL)} className="text-slate-500 hover:text-indigo-600 font-medium">Exit Quiz</button>
                    <h2 className="font-bold text-slate-800">Quiz: {material.title}</h2>
                    <div className="w-10"></div>
                </div>
                <QuizView 
                    questions={material.mcqs} 
                    onComplete={handleQuizComplete} 
                />
            </div>
        ) : <div>Error: Material not found</div>;

      case ViewState.STUDY_SUMMARY:
         return material ? (
             <SummaryView summary={material.summary} title={material.title} onBack={() => setCurrentView(ViewState.COURSE_DETAIL)} />
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
      
      case ViewState.COURSE_DETAIL:
          return course ? (
             <CourseDetailView 
                course={course}
                onBack={() => setCurrentView(ViewState.COURSES)}
                onAddMaterial={() => {
                    setActiveCourseId(course.id);
                    setCurrentView(ViewState.UPLOAD);
                }}
                onStartSession={handleStartSession}
             />
          ) : <div>Course Not Found</div>;

      case ViewState.ANALYTICS:
          return <AnalyticsView courses={courses} />;
      
      case ViewState.PROFILE:
          return <ProfileView />;

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