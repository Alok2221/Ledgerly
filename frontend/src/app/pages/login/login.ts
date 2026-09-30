import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  template: `
    <div class="auth-wrap">
      <mat-card>
        <mat-card-header>
          <mat-card-title>Ledgerly</mat-card-title>
          <mat-card-subtitle>Sign in to your invoice ledger</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="username" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Password</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="current-password" />
            </mat-form-field>
            @if (error) {
              <p class="error">{{ error }}</p>
            }
            <button mat-flat-button color="primary" class="full" [disabled]="form.invalid || loading">
              Sign in
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/register">Create account</a>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: `
    .auth-wrap {
      min-height: 100vh;
      display: grid;
      place-items: center;
      padding: 1rem;
      background:
        radial-gradient(circle at top left, #d7e7ff, transparent 45%),
        radial-gradient(circle at bottom right, #e8f0f8, transparent 40%),
        #f4f7fb;
    }
    mat-card { width: min(420px, 100%); padding-bottom: 0.5rem; }
    .full { width: 100%; display: block; margin-top: 0.75rem; }
    .error { color: #b3261e; margin: 0 0 0.5rem; }
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Could not sign in';
      },
      complete: () => (this.loading = false),
    });
  }
}
