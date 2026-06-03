import { Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  private readonly apiService = inject(ApiService);
  private readonly formBuilder = inject(NonNullableFormBuilder);
  private readonly router = inject(Router);

  readonly registerForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  isLoading = false;
  errorMessage = '';
  successMessage = '';

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.apiService.register(this.registerForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Registration successful. Redirecting to login...';
        this.isLoading = false;
        setTimeout(() => void this.router.navigate(['/login']), 1000);
      },
      error: (error) => {
        this.errorMessage = this.readErrorMessage(error, 'Registration failed. Please try again.');
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
