export type JeeExamType = 'JEE Main' | 'JEE Advanced';
export type JeeDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Advanced';
export type JeeQuestionType = 'single_correct' | 'multiple_correct' | 'numerical';
export type JeeEra = 'all' | 'recent' | 'classic'; // recent: 2022-2026, classic: 2015-2021

export interface JeeQuestionOption {
  id: string; // 'A' | 'B' | 'C' | 'D'
  text: string;
}

export interface JeeQuestion {
  id: string;
  chapterId: string;
  chapterTitle: string;
  topic: string;
  exam: JeeExamType;
  year: number; // 2015 to 2026
  sessionOrPaper: string; // e.g., "Jan 22 Shift 1", "Paper 1", "April 5 Shift 2"
  difficulty: JeeDifficulty;
  questionType: JeeQuestionType;
  statement: string;
  diagramUrl?: string;
  options?: JeeQuestionOption[];
  correctAnswer: string | string[] | number; // e.g. "B", ["A", "C"], or 4.5
  numericalTolerance?: number; // for numerical questions (e.g. ±0.1)
  numericalUnit?: string;
  hint: string;
  stepByStepSolution: string[];
  keyConcept: string;
  examTrap: string;
  shortcutTrick?: string;
}

export interface MockExamState {
  questions: JeeQuestion[];
  currentIndex: number;
  answers: Record<string, string | string[] | number>;
  markedForReview: Record<string, boolean>;
  visited: Record<string, boolean>;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  isSubmitted: boolean;
  startTime: number;
}

export interface MockExamResult {
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  score: number; // +4 for correct, -1 for incorrect, 0 for unattempted
  maxScore: number;
  percentage: number;
  accuracy: number;
  timeSpentSeconds: number;
}
