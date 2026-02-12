import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, Navigate } from 'react-router-dom';
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
import CalendarView from './components/CalendarView';
import LoginView from './components/LoginView';
import SignUpView from './components/SignUpView';
import OnboardingView from './components/OnboardingView';
import EditMaterialView from './components/EditMaterialView';
import ProtectedRoute from './components/ProtectedRoute';
import { UserProvider, useUser } from './contexts/UserContext';
import { ViewState, Course, LectureMaterial, MaterialStatus } from './types';
import { MOCK_COURSES } from './constants';
import { generateStudyPack } from './services/geminiService';

const STORAGE_KEY = 'medoraGPT_courses_v3'; 

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { checkBadges } = useUser();
  
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

  // Edit State
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  // Persistence Effect
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  // Calculate Dashboard Statistics
  const getDashboardStats = () => {
    let dueReviews = 0;
    let mastered = 0;
    let totalCards = 0;
    let totalMinutes = 0;
    const now = new Date();

    courses.forEach(c => {
      c.materials.forEach(m => {
        totalMinutes += m.studyMinutes || 0;
        m.flashcards.forEach(f => {
          totalCards++;
          if (f.difficulty === 'mastered') mastered++;
          // Parse ISO date
          if (new Date(f.nextReview) <= now) dueReviews++;
        });
      });
    });

    const retention = totalCards > 0 ? Math.round((mastered / totalCards) * 100) : 0;
    const hours = (totalMinutes / 60).toFixed(1);
    
    return { 
        dueReviews: dueReviews.toString(), 
        mastered: mastered.toString(), 
        studyHours: hours + 'h', 
        retention: retention + '%' 
    };
  };

  const dashboardStats = getDashboardStats();

  const handleStartSession = (courseId: string, materialId: string, mode: ViewState) => {
    let path = '';
    switch(mode) {
        case ViewState.STUDY_FLASHCARDS: path = 'flashcards'; break;
        case ViewState.STUDY_QUIZ: path = 'quiz'; break;
        case ViewState.STUDY_SUMMARY: path = 'summary'; break;
        default: path = 'summary';
    }
    navigate(`/study/${courseId}/${materialId}/${path}`);
  };

  const handleAddCourse = () => {
    setCourseToEdit(null);
    navigate('/courses/new');
  };

  const handleEditCourse = (course: Course) => {
    setCourseToEdit(course);
    navigate('/courses/new');
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
            exams: courseData.exams || [],
            color: courseData.color || 'bg-indigo-500',
            materials: []
        };
        setCourses(prev => [...prev, newCourse]);
    }
    navigate('/courses');
  };

  const handleDeleteCourse = (courseId: string) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleManageMaterials = (courseId: string) => {
      navigate(`/courses/${courseId}`);
  };

  const handleUpdateMaterial = (courseId: string, materialId: string, updates: Partial<LectureMaterial>) => {
    setCourses(prev => prev.map(c => {
        if (c.id !== courseId) return c;
        return {
            ...c,
            materials: c.materials.map(m => m.id === materialId ? { ...m, ...updates } : m)
        };
    }));
  };

  const handleDeleteMaterial = (courseId: string, materialId: string) => {
      setCourses(prev => prev.map(c => {
          if (c.id !== courseId) return c;
          return {
              ...c,
              materials: c.materials.filter(m => m.id !== materialId)
          };
      }));
  };

  // SM-2 Spaced Repetition Logic Implementation
  const handleCardRating = (courseId: string, materialId: string, cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
      setCourses(prevCourses => {
          return prevCourses.map(course => {
              if (course.id !== courseId) return course;
              return {
                  ...course,
                  materials: course.materials.map(mat => {
                      if (mat.id !== materialId) return mat;
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

  const handleStudyComplete = (courseId: string, materialId: string, minutes: number, result?: {score?: number, total?: number, cardsReviewed?: number}) => {
      // Trigger Badge Check
      const newBadges = checkBadges({
          cardsReviewed: result?.cardsReviewed,
          quizScore: result?.score,
          quizTotal: result?.total
      });
      
      if (newBadges.length > 0) {
          // Ideally show a toast here, but simple alert for now or silence
          console.log("Unlocked badges:", newBadges); 
      }

      setCourses(prevCourses => {
          return prevCourses.map(course => {
              if (course.id !== courseId) return course;
              return {
                  ...course,
                  materials: course.materials.map(mat => {
                      if (mat.id !== materialId) return mat;
                      const updates: Partial<LectureMaterial> = {
                          studyMinutes: (mat.studyMinutes || 0) + minutes
                      };
                      if (result?.score !== undefined && result?.total !== undefined) {
                          const history = mat.quizHistory || [];
                          updates.quizHistory = [...history, { date: new Date().toISOString(), score: result.score, total: result.total }];
                      }
                      return { ...mat, ...updates };
                  })
              };
          });
      });
      navigate(`/courses/${courseId}`);
  };

  const handleUpload = async (courseId: string, title: string, text: string, examIds: string[] = []) => {
    const newMaterialId = Math.random().toString(36).substr(2, 9);
    try {
      // 1. Create a placeholder material
      const placeholder: LectureMaterial = {
          id: newMaterialId,
          title: title,
          examIds: examIds,
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
      
      navigate(`/courses/${courseId}`);

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

  // Wrapper components for routes with params
  const CourseDetailWrapper = () => {
      const { id } = useParams();
      const course = courses.find(c => c.id === id);
      if (!course) return <div>Course not found</div>;
      return (
        <CourseDetailView 
            course={course} 
            onBack={() => navigate('/courses')} 
            onAddMaterial={() => navigate(`/upload?courseId=${course.id}`)}
            onStartSession={handleStartSession}
            onUpdateMaterial={handleUpdateMaterial}
            onDeleteMaterial={handleDeleteMaterial}
        />
      );
  };

  const UploadWrapper = () => {
     const urlParams = new URLSearchParams(window.location.search);
     const courseId = urlParams.get('courseId');
     return <UploadView courses={courses} onUpload={handleUpload} preSelectedCourseId={courseId} />;
  }
  
  const EditMaterialWrapper = () => {
      return <EditMaterialView courses={courses} onUpdate={handleUpdateMaterial} />;
  };

  const StudyWrapper = () => {
      const { courseId, materialId, mode } = useParams();
      const course = courses.find(c => c.id === courseId);
      const material = course?.materials.find(m => m.id === materialId);
      
      if (!course || !material) return <div>Material not found</div>;

      const onDone = () => navigate(`/courses/${courseId}`);

      if (mode === 'flashcards') {
          return (
            <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <button onClick={onDone} className="text-slate-500 hover:text-indigo-600 font-medium">Close</button>
                    <h2 className="font-bold text-slate-800">{material.title}</h2>
                    <div className="w-10"></div>
                </div>
                <FlashcardView 
                   cards={material.flashcards} 
                   onRateCard={(cardId, rating) => handleCardRating(courseId!, materialId!, cardId, rating)}
                   onComplete={(minutes, count) => handleStudyComplete(courseId!, materialId!, minutes, {cardsReviewed: count})}
                />
            </div>
          );
      }
      if (mode === 'quiz') {
          return (
            <div className="h-full flex flex-col">
                <div className="p-4 bg-white border-b border-slate-200 flex justify-between items-center">
                    <button onClick={onDone} className="text-slate-500 hover:text-indigo-600 font-medium">Exit Quiz</button>
                    <h2 className="font-bold text-slate-800">Quiz: {material.title}</h2>
                    <div className="w-10"></div>
                </div>
                <QuizView 
                    questions={material.mcqs} 
                    onComplete={(score, total, minutes) => handleStudyComplete(courseId!, materialId!, minutes, {score, total})}
                />
            </div>
          );
      }
      if (mode === 'summary') {
          return <SummaryView summary={material.summary} title={material.title} onBack={onDone} />;
      }

      return <div>Unknown mode</div>;
  };

  return (
    <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginView />} />
        <Route path="/signup" element={<SignUpView />} />
        
        {/* Onboarding - Protected but outside layout */}
        <Route path="/onboarding" element={
            <ProtectedRoute>
                <OnboardingView />
            </ProtectedRoute>
        } />

        {/* Main Protected Routes */}
        <Route path="/*" element={
            <ProtectedRoute>
                <Layout courses={courses}>
                    <Routes>
                        <Route path="/" element={<Dashboard courses={courses} stats={dashboardStats} onStartSession={handleStartSession} />} />
                        <Route path="/calendar" element={<CalendarView courses={courses} />} />
                        <Route path="/courses" element={
                            <CoursesView 
                                courses={courses} 
                                onAddCourse={handleAddCourse}
                                onEditCourse={handleEditCourse}
                                onDeleteCourse={handleDeleteCourse}
                                onManageMaterials={handleManageMaterials}
                            />
                        } />
                        <Route path="/courses/new" element={
                            <CourseForm initialData={courseToEdit} onSave={handleSaveCourse} onCancel={() => navigate('/courses')} />
                        } />
                        <Route path="/courses/:id" element={<CourseDetailWrapper />} />
                        <Route path="/courses/:courseId/materials/:materialId/edit" element={<EditMaterialWrapper />} />
                        <Route path="/upload" element={<UploadWrapper />} />
                        <Route path="/analytics" element={<AnalyticsView courses={courses} onStartSession={handleStartSession} />} />
                        <Route path="/profile" element={<ProfileView />} />
                        <Route path="/study/:courseId/:materialId/:mode" element={<StudyWrapper />} />
                    </Routes>
                </Layout>
            </ProtectedRoute>
        } />
    </Routes>
  );
};

const App: React.FC = () => {
    return (
        <UserProvider>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </UserProvider>
    );
}

export default App;