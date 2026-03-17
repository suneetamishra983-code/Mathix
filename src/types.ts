export type Theme = 'light' | 'dark';
export type Language = 'en' | 'hi';

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string;
  theme: Theme;
  language: Language;
  createdAt: string;
}

export interface Progress {
  userId: string;
  totalQuestions: number;
  correctAnswers: number;
  level: number;
  accuracy: number;
  weakTopics: string[];
  topicPerformance: Record<string, { correct: number; total: number }>;
  lastUpdated: string;
}

export interface TestResult {
  id?: string;
  userId: string;
  score: number;
  total: number;
  accuracy: number;
  date: string;
  feedback: string;
}

export interface LeaderboardEntry {
  userId: string;
  displayName: string;
  photoURL: string;
  score: number;
  rank?: number;
}

export interface Question {
  id: string;
  textEn: string;
  textHi: string;
  optionsEn: string[];
  optionsHi: string[];
  correctIndex: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topic: string;
  explanationEn: string;
  explanationHi: string;
  tipEn: string;
  tipHi: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  attachment?: {
    data: string;
    mimeType: string;
    name: string;
  };
}
