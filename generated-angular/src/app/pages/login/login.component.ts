import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { LoginResponse } from '../../models/api.models';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private readonly apiService = inject(ApiService);
  private readonly authService = inject(AuthService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]]
  });

  isLoading = false;
  errorMessage = '';

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.login(this.loginForm.getRawValue()).subscribe({
      next: (response) => {
        const token = this.extractToken(response);

        if (!token) {
          this.errorMessage = 'Login succeeded, but no JWT token was returned.';
          this.isLoading = false;
          return;
        }

        this.authService.setToken(token);
        void this.router.navigate(['/game']);
      },
      error: (error) => {
        this.errorMessage = this.readErrorMessage(error, 'Invalid email or password.');
        this.isLoading = false;
      }
    });
  }

  private extractToken(response: LoginResponse | string): string {
    if (typeof response === 'string') {
      return response;
    }

    return response.token ?? response.jwtToken ?? response.accessToken ?? '';
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
