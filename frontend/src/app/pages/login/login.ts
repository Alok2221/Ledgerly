import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AuthService } from '../../core/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="auth-screen">
      <div class="auth-inner">
        <section class="hero">
          <p class="eyebrow">Invoice ledger for freelancers</p>
          <h1>Ledgerly</h1>
          <p class="lede">Track clients, send invoices, and see what is still unpaid - without spreadsheet chaos.</p>
        </section>

        <section class="panel auth-panel">
          <h2>Sign in</h2>
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
            <button mat-flat-button class="btn-primary full" [disabled]="form.invalid || loading">Sign in</button>
          </form>
          <p class="switch">
            New here?
            <a routerLink="/register">Create an account</a>
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
