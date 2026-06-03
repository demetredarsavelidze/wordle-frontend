import { Component, OnInit, inject } from '@angular/core';

import { GameHistoryItem } from '../../models/api.models';
import { ApiService } from '../../services/api.service';

interface GameHistoryRow {
  gameId: number | string;
  attempts: number;
  result: string;
  startDate: string;
  endDate: string;
}

@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  games: GameHistoryRow[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadGames();
  }

  loadGames(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getGames().subscribe({
      next: (games) => {
        this.games = games.map((game) => this.toRow(game));
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.readErrorMessage(error, 'Could not load game history.');
        this.isLoading = false;
      }
    });
  }

  private toRow(game: GameHistoryItem): GameHistoryRow {
    const isWin = game.isWin ?? game.won ?? game.win ?? false;

    return {
      gameId: game.gameId ?? game.id ?? '',
      attempts: game.attempts ?? game.attemptCount ?? 0,
      result: isWin ? 'Win' : 'Loss',
      startDate: this.formatDate(game.startDate ?? game.startedAt),
      endDate: this.formatDate(game.endDate ?? game.endedAt)
    };
  }

  private formatDate(value: string | null | undefined): string {
    if (!value) {
      return '-';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString();
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
