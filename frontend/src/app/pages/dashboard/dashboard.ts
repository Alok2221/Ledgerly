import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { DashboardSummary } from '../../models/models';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatButtonModule, RouterLink, MoneyPipe, DatePipe],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="page-kicker">This period</p>
          <h1>Dashboard</h1>
        </div>
        <a mat-flat-button class="btn-accent" routerLink="/invoices/new">New invoice</a>
      </header>

      @if (summary) {
        <div class="stats">
          <article class="stat">
            <span class="label">Issued</span>
            <span class="value">{{ summary.issuedGross | money }}</span>
          </article>
          <article class="stat">
            <span class="label">Paid</span>
            <span class="value">{{ summary.paidGross | money }}</span>
          </article>
          <article class="stat">
            <span class="label">Outstanding</span>
            <span class="value">{{ summary.outstandingGross | money }}</span>
          </article>
        </div>

        <section>
          <div class="section-head">
            <p class="page-kicker">Next 14 days</p>
            <h2 class="section-title">Due soon</h2>
          </div>

          @if (summary.upcomingDue.length === 0) {
            <p class="muted">No sent invoices due in the next two weeks.</p>
          } @else {
            <div class="table-wrap desktop-only">
              <table class="ledger-table">
                <thead>
                  <tr>
                    <th>Number</th>
                    <th>Client</th>
                    <th>Due</th>
                    <th>Gross</th>
                  </tr>
                </thead>
                <tbody>
                  @for (row of summary.upcomingDue; track row.id) {
                    <tr>
                      <td><a [routerLink]="['/invoices', row.id]">{{ row.number }}</a></td>
                      <td>{{ row.clientName }}</td>
                      <td>{{ row.dueDate | date: 'yyyy-MM-dd' }}</td>
                      <td>{{ row.grossTotal | money }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>

            <div class="mobile-list mobile-only">
              @for (row of summary.upcomingDue; track row.id) {
                <a class="mobile-card" [routerLink]="['/invoices', row.id]">
                  <div class="card-top">
                    <div class="card-title">{{ row.number }}</div>
                    <strong>{{ row.grossTotal | money }}</strong>
                  </div>
                  <div class="card-meta">
                    <span>{{ row.clientName }}</span>
                    <span>Due {{ row.dueDate | date: 'yyyy-MM-dd' }}</span>
                  </div>
                </a>
              }
            </div>
          }
        </section>
      }
    </div>
  `,
  styles: `
    .section-head { margin-bottom: var(--space-3); }
    .section-title {
      margin: 0.15rem 0 0;
      font-family: var(--font-display);
      font-size: clamp(1.2rem, 1rem + 1vw, 1.45rem);
      font-weight: 650;
    }
    .mobile-card {
      text-decoration: none;
      color: inherit;
    }
    .mobile-card strong {
      font-family: var(--font-display);
      color: var(--ink);
    }
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary: DashboardSummary | null = null;

  ngOnInit(): void {
    this.api.getDashboard().subscribe((s) => (this.summary = s));
  }
}
