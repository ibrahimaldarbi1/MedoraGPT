export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  MANAGE_COURSE = 'MANAGE_COURSE',
  COURSE_DETAIL = 'COURSE_DETAIL',
  UPLOAD = 'UPLOAD',
  STUDY_SUMMARY = 'STUDY_SUMMARY',
  STUDY_FLASHCARDS = 'STUDY_FLASHCARDS',
  STUDY_QUIZ = 'STUDY_QUIZ',
  ANALYTICS = 'ANALYTICS',
  PROFILE = 'PROFILE'
}

export enum MaterialStatus {
  PROCESSING = 'Processing',
  READY = 'Ready',
  ERROR = 'Error'
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  difficulty: 'new' | 'learning' | 'review' | 'mastered';
  nextReview: string; // ISO Date
  interval?: number; // Days until next review
  easeFactor?: number; // SM-2 Ease Factor (default 2.5)
  repetitions?: number; // Consecutive correct answers
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuizResult {
  date: string;
  score: number;
  total: number;
}

export interface LectureMaterial {
  id: string;
  title: string;
  dateAdded: string;
  status: MaterialStatus;
  summary: string;
  flashcards: Flashcard[];
  mcqs: MCQ[];
  topics: string[];
  weakTopics: string[];
  quizHistory?: QuizResult[];
  studyMinutes?: number;
}

export interface Course {
  id: string;
  name: string;
  instructor?: string;
  examDate?: string;
  color: string;
  materials: LectureMaterial[];
}

export interface StudySessionStats {
  cardsReviewed: number;
  questionsAnswered: number;
  correctAnswers: number;
  streakDays: number;
  totalStudyMinutes: number;
}