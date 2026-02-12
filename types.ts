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
  PROFILE = 'PROFILE',
  CALENDAR = 'CALENDAR'
}

export enum MaterialStatus {
  PROCESSING = 'Processing',
  READY = 'Ready',
  ERROR = 'Error'
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string; // Lucide icon name
  color: string;
}

export type QuestType = 'REVIEW_CARDS' | 'ACE_QUIZ' | 'UPLOAD_LECTURE';

export interface Quest {
  id: string;
  type: QuestType;
  description: string;
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  icon: string;
}

export interface User {
  name: string;
  email: string;
  university?: string;
  majors?: string[];
  studyGoal?: 'Daily' | 'Cramming' | 'Casually';
  onboardingComplete?: boolean;
  streak: number;
  lastStudyDate?: string; // ISO Date YYYY-MM-DD
  xp: number;
  badges: string[]; // List of unlocked badge IDs
  dailyStats: {
    date: string;
    cardsStudied: number;
  };
  dailyQuests: Quest[];
  lastQuestGenerationDate: string;
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
  examIds: string[]; // Changed from single examId to array to support multiple exams
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

export interface Exam {
  id: string;
  title: string; // e.g., "Midterm", "Final", "Exam 1"
  date: string; // ISO Date YYYY-MM-DD
}

export interface Course {
  id: string;
  name: string;
  instructor?: string;
  exams: Exam[]; 
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