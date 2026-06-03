import { Component, OnInit, inject } from '@angular/core';

import { StatisticsResponse } from '../../models/api.models';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrl: './statistics.component.css'
})
export class StatisticsComponent implements OnInit {
  private readonly apiService = inject(ApiService);

  statistics: StatisticsResponse | null = null;
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadStatistics();
  }

  loadStatistics(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getStatistics().subscribe({
      next: (statistics) => {
        this.statistics = statistics;
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage = this.readErrorMessage(error, 'Could not load statistics.');
        this.isLoading = false;
      }
    });
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
