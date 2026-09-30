import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from '../core/auth.service';
import { CurrencyService, DisplayCurrency } from '../core/currency.service';
import { ThemeService } from '../core/theme.service';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, MatButtonModule, MatIconModule, MatMenuModule],
  template: `
    <div class="app-frame">
      <header class="shell-bar">
        <a routerLink="/dashboard" class="brand">
          <span class="brand-mark" aria-hidden="true">L</span>
          <span class="brand-text">
            <strong>Ledgerly</strong>
            <small>freelance ledger</small>
          </span>
        </a>

        <nav class="nav" aria-label="Main">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/clients" routerLinkActive="active">Clients</a>
          <a routerLink="/invoices" routerLinkActive="active">Invoices</a>
        </nav>

        <div class="shell-tools">
          <div class="currency-switch" role="group" aria-label="Display currency">
            @for (code of currencies; track code) {
              <button
                type="button"
                [class.active]="currency.currency() === code"
                (click)="currency.setCurrency(code)"
              >
                {{ code }}
              </button>
            }
          </div>

          <button
            type="button"
            class="icon-btn"
            (click)="theme.toggle()"
            [attr.aria-label]="theme.mode() === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'"
          >
            <mat-icon>{{ theme.mode() === 'dark' ? 'light_mode' : 'dark_mode' }}</mat-icon>
          </button>

          <button
            type="button"
            class="account"
            [matMenuTriggerFor]="accountMenu"
            aria-label="Account menu"
          >
            <span class="avatar" aria-hidden="true">{{ initials }}</span>
            <span class="account-meta">
              <strong>{{ auth.currentUser()?.displayName }}</strong>
              <small>Account</small>
            </span>
            <mat-icon>expand_more</mat-icon>
          </button>
        </div>

        <mat-menu #accountMenu="matMenu" xPosition="before">
          <button mat-menu-item type="button" (click)="auth.logout()">
            <mat-icon>logout</mat-icon>
            <span>Log out</span>
          </button>
        </mat-menu>
      </header>

      <main class="shell-main">
        @if (currency.rateLabel()) {
          <p class="fx-banner">{{ currency.rateLabel() }}</p>
        }
        <router-outlet />
      </main>
    </div>
  `,
  styles: `
    .app-frame {
      min-height: 100dvh;
      display: flex;
      flex-direction: column;
    }

    .shell-bar {
      position: sticky;
      top: 0;
      z-index: 20;
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: center;
      gap: clamp(0.6rem, 2vw, 1.25rem);
      padding:
        calc(0.7rem + var(--safe-top))
        calc(var(--page-x) + var(--safe-right))
        0.7rem
        calc(var(--page-x) + var(--safe-left));
      border-bottom: 1px solid var(--line);
      background: var(--shell-bg);
      backdrop-filter: blur(10px);
    }

    .brand {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      min-width: 0;
      text-decoration: none;
      color: var(--ink);
    }

    .brand-mark {
      flex: 0 0 auto;
      display: grid;
      place-items: center;
      width: 2.25rem;
      height: 2.25rem;
      border-radius: 10px;
      background: var(--ink);
      color: var(--on-ink);
      font-family: var(--font-display);
      font-weight: 650;
      font-size: 1.15rem;
    }

    .brand-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
      line-height: 1.15;
    }

    .brand-text strong {
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 0.95rem + 0.5vw, 1.25rem);
      font-weight: 650;
      letter-spacing: -0.02em;
    }

    .brand-text small,
    .account-meta small {
      color: var(--muted);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.06em;
      text-transform: uppercase;
    }

    .nav {
      display: flex;
      justify-content: center;
      gap: 0.25rem;
      min-width: 0;
      overflow-x: auto;
      scrollbar-width: none;
      -webkit-overflow-scrolling: touch;
    }

    .nav::-webkit-scrollbar {
      display: none;
    }

    .nav a {
      flex: 0 0 auto;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: var(--touch);
      padding: 0.45rem 0.9rem;
      border-radius: 999px;
      text-decoration: none;
      color: var(--muted);
      font-weight: 600;
      white-space: nowrap;
      transition: background 0.2s ease, color 0.2s ease;
    }

    .nav a:hover {
      color: var(--ink);
      background: var(--nav-hover);
    }

    .nav a.active {
      color: var(--ink);
      background: var(--nav-active);
    }

    .shell-tools {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-width: 0;
    }

    .currency-switch {
      display: inline-flex;
      padding: 0.2rem;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--panel);
    }

    .currency-switch button {
      min-height: 2rem;
      padding: 0 0.55rem;
      border: 0;
      border-radius: 999px;
      background: transparent;
      color: var(--muted);
      font: inherit;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      cursor: pointer;
    }

    .currency-switch button.active {
      background: var(--ink);
      color: var(--on-ink);
    }

    .icon-btn {
      display: grid;
      place-items: center;
      width: 2.5rem;
      height: 2.5rem;
      border: 1px solid var(--line);
      border-radius: 50%;
      background: var(--panel);
      color: var(--ink);
      cursor: pointer;
    }

    .icon-btn:hover,
    .account:hover {
      border-color: color-mix(in srgb, var(--ink) 35%, var(--line));
    }

    .account {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      min-height: var(--touch);
      max-width: 100%;
      padding: 0.25rem 0.45rem 0.25rem 0.25rem;
      border: 1px solid var(--line);
      border-radius: 999px;
      background: var(--panel);
      cursor: pointer;
      color: var(--ink);
      font: inherit;
    }

    .avatar {
      display: grid;
      place-items: center;
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: var(--paper-deep);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .account-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      min-width: 0;
      line-height: 1.15;
      text-align: left;
    }

    .account-meta strong {
      font-size: 0.88rem;
      font-weight: 650;
      max-width: 9.5rem;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .fx-banner {
      margin: 0 0 var(--space-3);
      color: var(--muted);
      font-size: 0.82rem;
    }

    .shell-main {
      flex: 1;
      width: min(100%, var(--content-max));
      margin: 0 auto;
      padding:
        var(--page-y)
        calc(var(--page-x) + var(--safe-right))
        calc(var(--space-7) + var(--safe-bottom))
        calc(var(--page-x) + var(--safe-left));
    }

    @media (max-width: 900px) {
      .shell-bar {
        grid-template-columns: minmax(0, 1fr) auto;
        grid-template-areas:
          "brand tools"
          "nav nav";
        row-gap: 0.45rem;
      }
      .brand { grid-area: brand; }
      .shell-tools { grid-area: tools; }
      .nav {
        grid-area: nav;
        justify-content: flex-start;
        margin: 0 calc(-1 * var(--page-x));
        padding: 0 var(--page-x) 0.15rem;
      }
      .brand-text small { display: none; }
      .account-meta { display: none; }
      .account mat-icon { display: none; }
      .currency-switch button { padding: 0 0.42rem; }
    }
  `,
})
export class ShellComponent {
  auth = inject(AuthService);
  theme = inject(ThemeService);
  currency = inject(CurrencyService);
  currencies: DisplayCurrency[] = ['PLN', 'USD', 'EUR'];

  get initials(): string {
    const name = this.auth.currentUser()?.displayName?.trim() || 'U';
    const parts = name.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
}
