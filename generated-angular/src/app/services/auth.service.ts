import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

const TOKEN_KEY = 'wordle_jwt_token';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  readonly isAuthenticated = signal<boolean>(this.hasToken());

  constructor(private readonly router: Router) {}

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.isAuthenticated.set(true);
  }

  hasToken(): boolean {
    return Boolean(localStorage.getItem(TOKEN_KEY));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.isAuthenticated.set(false);
    void this.router.navigate(['/login']);
  }
}
