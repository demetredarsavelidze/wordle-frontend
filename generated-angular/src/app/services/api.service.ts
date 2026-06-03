import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AuthRequest,
  GameHistoryItem,
  GuessRequest,
  GuessResponse,
  LoginResponse,
  StartGameResponse,
  StatisticsResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiBaseUrl = 'https://localhost:7017/api';

  constructor(private readonly http: HttpClient) {}

  register(request: AuthRequest): Observable<void> {
    return this.http.post<void>(`${this.apiBaseUrl}/account/register`, request);
  }

  login(request: AuthRequest): Observable<LoginResponse | string> {
    return this.http.post<LoginResponse | string>(`${this.apiBaseUrl}/account/login`, request);
  }

  startGame(): Observable<StartGameResponse> {
    return this.http.post<StartGameResponse>(`${this.apiBaseUrl}/games/start`, {});
  }

  submitGuess(request: GuessRequest): Observable<GuessResponse> {
    return this.http.post<GuessResponse>(`${this.apiBaseUrl}/games/guess`, request);
  }

  getStatistics(): Observable<StatisticsResponse> {
    return this.http.get<StatisticsResponse>(`${this.apiBaseUrl}/statistics`);
  }

  getGames(): Observable<GameHistoryItem[]> {
    return this.http.get<GameHistoryItem[]>(`${this.apiBaseUrl}/games`);
  }

  getGame(id: number | string): Observable<GameHistoryItem> {
    return this.http.get<GameHistoryItem>(`${this.apiBaseUrl}/games/${id}`);
  }
}
