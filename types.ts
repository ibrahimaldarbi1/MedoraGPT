export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  COURSES = 'COURSES',
  MANAGE_COURSE = 'MANAGE_COURSE', // Added for Create/Edit
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
}

export interface MCQ {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
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