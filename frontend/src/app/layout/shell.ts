import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatToolbarModule, MatButtonModule, MatIconModule],
  template: `
    <mat-toolbar color="primary" class="topbar">
      <a routerLink="/dashboard" class="brand">Ledgerly</a>
      <nav class="nav">
        <a mat-button routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
        <a mat-button routerLink="/clients" routerLinkActive="active">Clients</a>
        <a mat-button routerLink="/invoices" routerLinkActive="active">Invoices</a>
      </nav>
      <span class="spacer"></span>
      <span class="user">{{ auth.currentUser()?.displayName }}</span>
      <button mat-icon-button type="button" (click)="auth.logout()" aria-label="Log out">
        <mat-icon>logout</mat-icon>
      </button>
    </mat-toolbar>
    <main class="content">
      <router-outlet />
    </main>
  `,
  styles: `
    .topbar { position: sticky; top: 0; z-index: 10; gap: 0.5rem; }
    .brand {
      color: inherit;
      text-decoration: none;
      font-weight: 600;
      letter-spacing: 0.02em;
      margin-right: 1rem;
    }
    .nav a.active { background: color-mix(in srgb, white 18%, transparent); }
    .spacer { flex: 1; }
    .user { opacity: 0.9; margin-right: 0.25rem; font-size: 0.9rem; }
    .content { max-width: 1100px; margin: 0 auto; padding: 1.5rem 1rem 3rem; }
  `,
})
export class ShellComponent {
  constructor(public auth: AuthService) {}
}
