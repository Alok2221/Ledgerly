import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
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
          <mat-card-title>Create account</mat-card-title>
          <mat-card-subtitle>Set up your freelancer account in Ledgerly</mat-card-subtitle>
        </mat-card-header>
        <mat-card-content>
          <form [formGroup]="form" (ngSubmit)="submit()">
            <mat-form-field appearance="outline" class="full">
              <mat-label>Display name</mat-label>
              <input matInput formControlName="displayName" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" autocomplete="username" />
            </mat-form-field>
            <mat-form-field appearance="outline" class="full">
              <mat-label>Password (min. 8 characters)</mat-label>
              <input matInput type="password" formControlName="password" autocomplete="new-password" />
            </mat-form-field>
            @if (error) {
              <p class="error">{{ error }}</p>
            }
            <button mat-flat-button color="primary" class="full" [disabled]="form.invalid || loading">
              Register
            </button>
          </form>
        </mat-card-content>
        <mat-card-actions align="end">
          <a mat-button routerLink="/login">Already have an account</a>
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
    mat-card { width: min(420px, 100%); }
    .full { width: 100%; display: block; margin-top: 0.75rem; }
    .error { color: #b3261e; margin: 0 0 0.5rem; }
  `,
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';
  form = this.fb.nonNullable.group({
    displayName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  submit(): void {
    if (this.form.invalid) return;
    this.loading = true;
    this.error = '';
    const { email, password, displayName } = this.form.getRawValue();
    this.auth.register(email, password, displayName).subscribe({
      next: () => this.router.navigateByUrl('/dashboard'),
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Could not register';
      },
      complete: () => (this.loading = false),
    });
  }
}
