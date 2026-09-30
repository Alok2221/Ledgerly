import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { ApiService } from '../../core/api.service';
import { DashboardSummary } from '../../models/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatTableModule, RouterLink, CurrencyPipe, DatePipe],
  template: `
    <div class="header">
      <div>
        <h1>Dashboard</h1>
        <p class="muted">Revenue summary for the current period</p>
      </div>
      <a mat-flat-button color="primary" routerLink="/invoices/new">New invoice</a>
    </div>

    @if (summary) {
      <div class="stats">
        <mat-card>
          <mat-card-subtitle>Issued</mat-card-subtitle>
          <mat-card-title>{{ summary.issuedGross | currency: 'PLN' }}</mat-card-title>
        </mat-card>
        <mat-card>
          <mat-card-subtitle>Paid</mat-card-subtitle>
          <mat-card-title>{{ summary.paidGross | currency: 'PLN' }}</mat-card-title>
        </mat-card>
        <mat-card>
          <mat-card-subtitle>Outstanding</mat-card-subtitle>
          <mat-card-title>{{ summary.outstandingGross | currency: 'PLN' }}</mat-card-title>
        </mat-card>
      </div>

      <h2>Upcoming due dates</h2>
      @if (summary.upcomingDue.length === 0) {
        <p class="muted">No invoices due within the next 14 days.</p>
      } @else {
        <table mat-table [dataSource]="summary.upcomingDue" class="full">
          <ng-container matColumnDef="number">
            <th mat-header-cell *matHeaderCellDef>Number</th>
            <td mat-cell *matCellDef="let row">
              <a [routerLink]="['/invoices', row.id]">{{ row.number }}</a>
            </td>
          </ng-container>
          <ng-container matColumnDef="clientName">
            <th mat-header-cell *matHeaderCellDef>Client</th>
            <td mat-cell *matCellDef="let row">{{ row.clientName }}</td>
          </ng-container>
          <ng-container matColumnDef="dueDate">
            <th mat-header-cell *matHeaderCellDef>Due</th>
            <td mat-cell *matCellDef="let row">{{ row.dueDate | date: 'yyyy-MM-dd' }}</td>
          </ng-container>
          <ng-container matColumnDef="grossTotal">
            <th mat-header-cell *matHeaderCellDef>Gross</th>
            <td mat-cell *matCellDef="let row">{{ row.grossTotal | currency: 'PLN' }}</td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="cols"></tr>
          <tr mat-row *matRowDef="let row; columns: cols"></tr>
        </table>
      }
    }
  `,
  styles: `
    .header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1rem; }
    h1, h2 { margin: 0 0 0.35rem; }
    .muted { color: color-mix(in srgb, var(--mat-sys-on-surface) 65%, transparent); margin: 0; }
    .stats { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1rem; margin: 1.25rem 0 2rem; }
    mat-card { padding: 1rem; }
    .full { width: 100%; }
    a { color: inherit; }
    @media (max-width: 800px) {
      .stats { grid-template-columns: 1fr; }
      .header { flex-direction: column; }
    }
  `,
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  summary: DashboardSummary | null = null;
  cols = ['number', 'clientName', 'dueDate', 'grossTotal'];

  ngOnInit(): void {
    this.api.getDashboard().subscribe((s) => (this.summary = s));
  }
}
