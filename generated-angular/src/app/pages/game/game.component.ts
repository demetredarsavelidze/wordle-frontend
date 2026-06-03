import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { GuessLetterResult, GuessResponse, LetterStatus, StartGameResponse } from '../../models/api.models';
import { ApiService } from '../../services/api.service';

interface DisplayAttempt {
  attemptNumber: number;
  results: GuessLetterResult[];
  isWin: boolean;
  isGameOver: boolean;
}

@Component({
  selector: 'app-game',
  imports: [FormsModule],
  templateUrl: './game.component.html',
  styleUrl: './game.component.css'
})
export class GameComponent {
  private readonly apiService = inject(ApiService);

  gameId: number | string | null = null;
  guess = '';
  attempts: DisplayAttempt[] = [];
  isStarting = false;
  isGuessing = false;
  errorMessage = '';
  infoMessage = 'Start a new game to begin guessing.';

  get currentAttempt(): DisplayAttempt | null {
    return this.attempts.at(-1) ?? null;
  }

  get isGameOver(): boolean {
    return this.currentAttempt?.isGameOver ?? false;
  }

  get isWin(): boolean {
    return this.currentAttempt?.isWin ?? false;
  }

  startGame(): void {
    this.isStarting = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.apiService.startGame().subscribe({
      next: (response) => {
        this.gameId = this.extractGameId(response);
        this.guess = '';
        this.attempts = [];
        this.infoMessage = `Game ${this.gameId} started. Enter your first 5-letter guess.`;
        this.isStarting = false;
      },
      error: (error) => {
        this.errorMessage = this.readErrorMessage(error, 'Could not start a new game.');
        this.isStarting = false;
      }
    });
  }

  submitGuess(): void {
    const normalizedGuess = this.guess.trim().toLowerCase();

    if (!this.gameId) {
      this.errorMessage = 'Start a game before submitting a guess.';
      return;
    }

    if (!/^[a-z]{5}$/.test(normalizedGuess)) {
      this.errorMessage = 'Guess must be exactly 5 letters.';
      return;
    }

    this.isGuessing = true;
    this.errorMessage = '';
    this.infoMessage = '';

    this.apiService.submitGuess({ gameId: this.gameId, guess: normalizedGuess }).subscribe({
      next: (response) => {
        const attempt = this.buildAttempt(response, normalizedGuess);
        this.attempts = [...this.attempts, attempt];
        this.guess = '';
        this.infoMessage = attempt.isWin
          ? 'You won the game!'
          : attempt.isGameOver
            ? 'Game over. Start a new game to try again.'
            : 'Guess submitted. Keep going.';
        this.isGuessing = false;
      },
      error: (error) => {
        this.errorMessage = this.readErrorMessage(error, 'Could not submit guess.');
        this.isGuessing = false;
      }
    });
  }

  trackByAttempt(_index: number, attempt: DisplayAttempt): number {
    return attempt.attemptNumber;
  }

  trackByTile(index: number): number {
    return index;
  }

  private extractGameId(response: StartGameResponse): number | string {
    return response.gameId ?? response.id ?? '';
  }

  private buildAttempt(response: GuessResponse, guess: string): DisplayAttempt {
    const attemptNumber = response.attemptNumber ?? response.attempt ?? response.attempts ?? this.attempts.length + 1;
    const isWin = response.isWin ?? response.won ?? response.win ?? false;
    const isGameOver = response.isGameOver ?? response.gameOver ?? isWin;

    return {
      attemptNumber,
      results: this.normalizeResults(response, guess),
      isWin,
      isGameOver
    };
  }

  private normalizeResults(response: GuessResponse, guess: string): GuessLetterResult[] {
    const responseRecord = response as Record<string, unknown>;
    const rawResults =
      response.results ??
      response.guessResults ??
      response.letters ??
      (Array.isArray(responseRecord['result']) ? responseRecord['result'] : undefined) ??
      [];

    if (!Array.isArray(rawResults) || rawResults.length === 0) {
      return guess.split('').map((letter) => ({ letter, status: 'absent' }));
    }

    return rawResults.slice(0, 5).map((rawResult, index) => this.normalizeTile(rawResult, guess[index] ?? ''));
  }

  private normalizeTile(rawResult: unknown, fallbackLetter: string): GuessLetterResult {
    if (typeof rawResult === 'string') {
      return {
        letter: fallbackLetter,
        status: this.normalizeStatus(rawResult)
      };
    }

    if (typeof rawResult === 'object' && rawResult !== null) {
      const tile = rawResult as Record<string, unknown>;
      const letter = String(tile['letter'] ?? tile['character'] ?? tile['value'] ?? fallbackLetter).slice(0, 1);
      const status = this.normalizeStatus(tile['status'] ?? tile['result']);

      return { letter, status };
    }

    return { letter: fallbackLetter, status: 'absent' };
  }

  private normalizeStatus(status: unknown): LetterStatus {
    const normalized = String(status).toLowerCase();

    if (normalized === 'correct' || normalized === 'present' || normalized === 'absent') {
      return normalized;
    }

    return 'absent';
  }

  private readErrorMessage(error: unknown, fallback: string): string {
    if (typeof error === 'object' && error !== null && 'error' in error) {
      const errorBody = (error as { error?: unknown }).error;

      if (typeof errorBody === 'string') {
        return errorBody;
      }

      if (typeof errorBody === 'object' && errorBody !== null && 'message' in errorBody) {
        return String((errorBody as { message?: unknown }).message ?? fallback);
      }
    }

    return fallback;
  }
}
