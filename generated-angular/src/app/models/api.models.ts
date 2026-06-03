export interface AuthRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  jwtToken?: string;
  accessToken?: string;
}

export interface StartGameResponse {
  gameId?: number | string;
  id?: number | string;
}

export interface GuessRequest {
  gameId: number | string;
  guess: string;
}

export type LetterStatus = 'correct' | 'present' | 'absent';

export interface GuessLetterResult {
  letter: string;
  status: LetterStatus;
}

export interface GuessResponse {
  gameId?: number | string;
  attemptNumber?: number;
  attempt?: number;
  attempts?: number;
  isWin?: boolean;
  won?: boolean;
  win?: boolean;
  isGameOver?: boolean;
  gameOver?: boolean;
  results?: GuessLetterResult[];
  guessResults?: GuessLetterResult[];
  letters?: GuessLetterResult[];
}

export interface StatisticsResponse {
  gamesPlayed: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  totalPoints: number;
}

export interface GameHistoryItem {
  gameId?: number | string;
  id?: number | string;
  attempts?: number;
  attemptCount?: number;
  isWin?: boolean;
  won?: boolean;
  win?: boolean;
  startDate?: string;
  startedAt?: string;
  endDate?: string | null;
  endedAt?: string | null;
}
