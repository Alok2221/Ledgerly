import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-screen">
      <div class="auth-inner">
        <section class="hero">
          <p class="eyebrow">Start in a minute</p>
          <h1>Ledgerly</h1>
          <p class="lede">One place for clients, invoice status, and monthly revenue — built for solo freelancers.</p>
        </section>

        <section class="panel auth-panel">
          <h2>Create account</h2>
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
            <button mat-flat-button class="btn-primary full" [disabled]="form.invalid || loading">Register</button>
          </form>
          <p class="switch">
            Already registered?
            <a routerLink="/login">Sign in</a>
          </p>
        </section>
      </div>
    </div>
  `,
  styles: `
    .auth-screen {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding:
        calc(var(--page-y) + var(--safe-top))
        calc(var(--page-x) + var(--safe-right))
        calc(var(--page-y) + var(--safe-bottom))
        calc(var(--page-x) + var(--safe-left));
    }
    .auth-inner {
      width: min(56rem, 100%);
      display: grid;
      grid-template-columns: minmax(0, 1.15fr) minmax(0, 0.95fr);
      gap: clamp(1.5rem, 4vw, 2.75rem);
      align-items: center;
    }
    .hero h1 {
      margin: 0.35rem 0 0.8rem;
      font-family: var(--font-display);
      font-size: clamp(2.4rem, 1.4rem + 5vw, 4.25rem);
      font-weight: 650;
      letter-spacing: -0.04em;
      line-height: 0.95;
      color: var(--ink);
    }
    .eyebrow {
      margin: 0;
      color: var(--brass);
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-size: 0.78rem;
    }
    .lede {
      max-width: 26rem;
      margin: 0;
      color: var(--muted);
      font-size: clamp(0.98rem, 0.92rem + 0.3vw, 1.05rem);
    }
    .auth-panel { width: 100%; max-width: 24rem; justify-self: end; }
    .auth-panel h2 {
      margin: 0 0 1rem;
      font-family: var(--font-display);
      font-size: clamp(1.35rem, 1.15rem + 0.8vw, 1.6rem);
    }
    .full { width: 100%; display: block; margin-top: 0.35rem; }
    .error { color: var(--warn); margin: 0 0 0.75rem; }
    .switch { margin: 1rem 0 0; color: var(--muted); }
    .switch a { color: var(--ink); font-weight: 650; }
    @media (max-width: 900px) {
      .auth-screen {
        place-items: start stretch;
        padding-top: calc(1.4rem + var(--safe-top));
      }
      .auth-inner {
        grid-template-columns: 1fr;
        gap: 1.35rem;
      }
      .auth-panel { justify-self: stretch; max-width: none; }
    }
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
