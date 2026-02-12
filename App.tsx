import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, useNavigate, useParams, useLocation, Navigate } from 'react-router-dom';
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
import { generateStudyPack } from './services/geminiService';
import { supabase } from './services/supabaseClient';

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const { checkBadges, isAuthenticated, isLoading: authLoading } = useUser();

  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoaded, setCoursesLoaded] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState<Course | null>(null);

  const loadCourses = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setCourses([]);
      setCoursesLoaded(true);
      return;
    }

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('user_id', session.user.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Failed to load courses:', error);
      setCourses([]);
    } else {
      const mapped: Course[] = (data || []).map(row => ({
        id: row.id,
        name: row.name,
        instructor: row.instructor || '',
        exams: row.exams || [],
        color: row.color || 'bg-indigo-500',
        materials: row.materials || [],
      }));
      setCourses(mapped);
    }
    setCoursesLoaded(true);
  }, []);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadCourses();
    } else if (!authLoading) {
      setCourses([]);
      setCoursesLoaded(true);
    }
  }, [isAuthenticated, authLoading, loadCourses]);

  const saveCourseToSupabase = useCallback(async (courseId: string, updates: Record<string, unknown>) => {
    const { error } = await supabase.from('courses').update(updates).eq('id', courseId);
    if (error) console.error('Failed to save course:', error);
  }, []);

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

  const handleSaveCourse = async (courseData: Partial<Course>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    if (courseData.id) {
      await supabase.from('courses').update({
        name: courseData.name,
        instructor: courseData.instructor,
        color: courseData.color,
        exams: courseData.exams,
      }).eq('id', courseData.id);

      setCourses(prev => prev.map(c => c.id === courseData.id ? { ...c, ...courseData } as Course : c));
    } else {
      const { data, error } = await supabase.from('courses').insert({
        user_id: session.user.id,
        name: courseData.name || 'New Course',
        instructor: courseData.instructor || '',
        color: courseData.color || 'bg-indigo-500',
        exams: courseData.exams || [],
        materials: [],
      }).select().single();

      if (!error && data) {
        const newCourse: Course = {
          id: data.id,
          name: data.name,
          instructor: data.instructor || '',
          exams: data.exams || [],
          color: data.color || 'bg-indigo-500',
          materials: [],
        };
        setCourses(prev => [...prev, newCourse]);
      }
    }
    navigate('/courses');
  };

  const handleDeleteCourse = async (courseId: string) => {
    await supabase.from('courses').delete().eq('id', courseId);
    setCourses(prev => prev.filter(c => c.id !== courseId));
  };

  const handleManageMaterials = (courseId: string) => {
    navigate(`/courses/${courseId}`);
  };

  const handleUpdateMaterial = (courseId: string, materialId: string, updates: Partial<LectureMaterial>) => {
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id !== courseId) return c;
        const updatedCourse = {
          ...c,
          materials: c.materials.map(m => m.id === materialId ? { ...m, ...updates } : m)
        };
        saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
        return updatedCourse;
      });
      return updated;
    });
  };

  const handleDeleteMaterial = (courseId: string, materialId: string) => {
    setCourses(prev => {
      const updated = prev.map(c => {
        if (c.id !== courseId) return c;
        const updatedCourse = {
          ...c,
          materials: c.materials.filter(m => m.id !== materialId)
        };
        saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
        return updatedCourse;
      });
      return updated;
    });
  };

  const handleCardRating = (courseId: string, materialId: string, cardId: string, rating: 'again' | 'hard' | 'good' | 'easy') => {
    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id !== courseId) return course;
        const updatedCourse = {
          ...course,
          materials: course.materials.map(mat => {
            if (mat.id !== materialId) return mat;
            return {
              ...mat,
              flashcards: mat.flashcards.map(card => {
                if (card.id !== cardId) return card;

                let interval = card.interval || 0;
                let ease = card.easeFactor || 2.5;
                let repetitions = card.repetitions || 0;

                if (rating === 'again') {
                  repetitions = 0;
                  interval = 1;
                } else {
                  if (repetitions === 0) {
                    interval = 1;
                  } else if (repetitions === 1) {
                    interval = 6;
                  } else {
                    interval = Math.ceil(interval * ease);
                  }
                  repetitions++;
                }

                if (rating === 'hard') ease = Math.max(1.3, ease - 0.2);
                if (rating === 'easy') ease += 0.15;

                const nextDate = new Date();
                nextDate.setDate(nextDate.getDate() + interval);

                return {
                  ...card,
                  difficulty: (rating === 'again' ? 'learning' : rating === 'easy' ? 'mastered' : 'review') as 'learning' | 'mastered' | 'review',
                  nextReview: nextDate.toISOString(),
                  interval,
                  easeFactor: ease,
                  repetitions
                };
              })
            };
          })
        };
        saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
        return updatedCourse;
      });
    });
  };

  const handleStudyComplete = (courseId: string, materialId: string, minutes: number, result?: {score?: number, total?: number, cardsReviewed?: number}) => {
    const newBadges = checkBadges({
      cardsReviewed: result?.cardsReviewed,
      quizScore: result?.score,
      quizTotal: result?.total
    });

    if (newBadges.length > 0) {
      console.log("Unlocked badges:", newBadges);
    }

    setCourses(prevCourses => {
      return prevCourses.map(course => {
        if (course.id !== courseId) return course;
        const updatedCourse = {
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
        saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
        return updatedCourse;
      });
    });
    navigate(`/courses/${courseId}`);
  };

  const handleUpload = async (courseId: string, title: string, text: string, examIds: string[] = []) => {
    const newMaterialId = Math.random().toString(36).substr(2, 9);
    try {
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

      setCourses(prev => {
        const updated = prev.map(c => {
          if (c.id === courseId) {
            const updatedCourse = { ...c, materials: [placeholder, ...c.materials] };
            saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
            return updatedCourse;
          }
          return c;
        });
        return updated;
      });

      navigate(`/courses/${courseId}`);

      const genResult = await generateStudyPack(text);

      setCourses(prev => {
        const updated = prev.map(c => {
          if (c.id === courseId) {
            const updatedCourse = {
              ...c,
              materials: c.materials.map(m => {
                if (m.id === newMaterialId) {
                  return {
                    ...m,
                    status: MaterialStatus.READY,
                    summary: genResult.summary,
                    flashcards: genResult.flashcards.map((f, i) => ({
                      id: `${newMaterialId}-f${i}`,
                      front: f.front,
                      back: f.back,
                      difficulty: 'new' as const,
                      nextReview: new Date().toISOString()
                    })),
                    mcqs: genResult.mcqs.map((q, i) => ({
                      id: `${newMaterialId}-q${i}`,
                      ...q
                    })),
                    topics: genResult.topics
                  };
                }
                return m;
              })
            };
            saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
            return updatedCourse;
          }
          return c;
        });
        return updated;
      });

    } catch (error) {
      console.error("Upload failed", error);
      setCourses(prev => {
        const updated = prev.map(c => {
          if (c.id === courseId) {
            const updatedCourse = {
              ...c,
              materials: c.materials.map(m => m.id === newMaterialId ? { ...m, status: MaterialStatus.ERROR } : m)
            };
            saveCourseToSupabase(courseId, { materials: updatedCourse.materials });
            return updatedCourse;
          }
          return c;
        });
        return updated;
      });
      throw error;
    }
  };

  const CourseDetailWrapper = () => {
    const { id } = useParams();
    const course = courses.find(c => c.id === id);
    if (!course) return <div className="p-8 text-center text-slate-500">Course not found</div>;
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
    const location = useLocation();
    const urlParams = new URLSearchParams(location.search);
    const courseId = urlParams.get('courseId');
    return <UploadView courses={courses} onUpload={handleUpload} preSelectedCourseId={courseId} />;
  };

  const EditMaterialWrapper = () => {
    return <EditMaterialView courses={courses} onUpdate={handleUpdateMaterial} />;
  };

  const StudyWrapper = () => {
    const { courseId, materialId, mode } = useParams();
    const course = courses.find(c => c.id === courseId);
    const material = course?.materials.find(m => m.id === materialId);

    if (!course || !material) return <div className="p-8 text-center text-slate-500">Material not found</div>;

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

  if (!coursesLoaded && isAuthenticated) {
    return null;
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginView />} />
      <Route path="/signup" element={<SignUpView />} />

      <Route path="/onboarding" element={
        <ProtectedRoute>
          <OnboardingView />
        </ProtectedRoute>
      } />

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
