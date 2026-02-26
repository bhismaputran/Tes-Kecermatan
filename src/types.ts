export enum TestStatus {
  IDLE = 'IDLE',
  INSTRUCTIONS = 'INSTRUCTIONS',
  PREPARATION = 'PREPARATION',
  RUNNING = 'RUNNING',
  ROUND_BREAK = 'ROUND_BREAK',
  FINISHED = 'FINISHED',
}

export enum QuestionType {
  NUMBERS = 'NUMBERS',
  LETTERS = 'LETTERS',
  SYMBOLS = 'SYMBOLS',
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user';
  isActive: boolean;
  createdAt: string;
}

export interface Question {
  masterSet: string[];
  questionSet: string[];
  correctAnswer: string;
}

export interface RoundResult {
  roundNumber: number;
  correct: number;
  incorrect: number;
  total: number;
}

export interface TestState {
  status: TestStatus;
  currentRound: number;
  totalRounds: number;
  score: {
    correct: number;
    incorrect: number;
  };
  roundResults: RoundResult[];
}
