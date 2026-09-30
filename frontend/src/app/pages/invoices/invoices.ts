import { Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ApiService } from '../../core/api.service';
import { Client, Invoice, InvoiceStatus } from '../../models/models';
import { MoneyPipe } from '../../shared/money.pipe';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
    MoneyPipe,
    DatePipe,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="page-kicker">Status workflow</p>
          <h1>Invoices</h1>
        </div>
        <a mat-flat-button class="btn-accent" routerLink="/invoices/new">New invoice</a>
      </header>

      <form class="filters panel" [formGroup]="filters" (ngSubmit)="load()">
        <mat-form-field appearance="outline" class="full-field">
          <mat-label>Status</mat-label>
          <mat-select formControlName="status">
            <mat-option value="">All</mat-option>
            <mat-option value="DRAFT">DRAFT</mat-option>
            <mat-option value="SENT">SENT</mat-option>
            <mat-option value="PAID">PAID</mat-option>
            <mat-option value="CANCELLED">CANCELLED</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-field">
          <mat-label>Client</mat-label>
          <mat-select formControlName="clientId">
            <mat-option value="">All</mat-option>
            @for (c of clients; track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-field">
          <mat-label>From</mat-label>
          <input matInput [matDatepicker]="fromPicker" formControlName="from" readonly />
          <mat-datepicker-toggle matSuffix [for]="fromPicker" aria-label="Open from date calendar"></mat-datepicker-toggle>
          <mat-datepicker #fromPicker></mat-datepicker>
        </mat-form-field>
        <mat-form-field appearance="outline" class="full-field">
          <mat-label>To</mat-label>
          <input matInput [matDatepicker]="toPicker" formControlName="to" readonly />
          <mat-datepicker-toggle matSuffix [for]="toPicker" aria-label="Open to date calendar"></mat-datepicker-toggle>
          <mat-datepicker #toPicker></mat-datepicker>
        </mat-form-field>
        <button mat-stroked-button type="submit" class="apply">Apply filters</button>
      </form>

      <div class="table-wrap desktop-only">
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Number</th>
              <th>Client</th>
              <th>Status</th>
              <th>Issued</th>
              <th>Due</th>
              <th>Gross</th>
            </tr>
          </thead>
          <tbody>
            @for (row of invoices; track row.id) {
              <tr>
                <td><a [routerLink]="['/invoices', row.id]">{{ row.number }}</a></td>
                <td>{{ row.clientName }}</td>
                <td><span class="status-chip" [class]="row.status">{{ row.status }}</span></td>
                <td>{{ row.issueDate | date: 'yyyy-MM-dd' }}</td>
                <td>{{ row.dueDate | date: 'yyyy-MM-dd' }}</td>
                <td>{{ row.grossTotal | money }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mobile-list mobile-only">
        @for (row of invoices; track row.id) {
          <a class="mobile-card invoice-card" [routerLink]="['/invoices', row.id]">
            <div class="card-top">
              <div class="card-title">{{ row.number }}</div>
              <span class="status-chip" [class]="row.status">{{ row.status }}</span>
            </div>
            <div class="card-meta">
              <span>{{ row.clientName }}</span>
              <span>Issued {{ row.issueDate | date: 'yyyy-MM-dd' }} · Due {{ row.dueDate | date: 'yyyy-MM-dd' }}</span>
              <strong>{{ row.grossTotal | money }}</strong>
            </div>
          </a>
        }
      </div>
    </div>
  `,
  styles: `
    .filters {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr)) auto;
      gap: var(--space-2) var(--space-3);
      align-items: start;
      margin-bottom: var(--space-4);
    }
    .apply {
      margin-top: 0.35rem;
      min-height: var(--touch);
    }
    .invoice-card {
      text-decoration: none;
      color: inherit;
      transition: transform 0.18s ease, border-color 0.18s ease;
    }
    .invoice-card:active {
      transform: scale(0.99);
    }
    .invoice-card strong {
      color: var(--ink);
      font-family: var(--font-display);
      font-size: 1.15rem;
    }
    @media (max-width: 1000px) {
      .filters {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .apply { grid-column: 1 / -1; width: 100%; }
    }
    @media (max-width: 600px) {
      .filters { grid-template-columns: 1fr; }
    }
  `,
})
export class InvoicesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  invoices: Invoice[] = [];
  clients: Client[] = [];
  filters = this.fb.group({
    status: this.fb.nonNullable.control('' as InvoiceStatus | ''),
    clientId: this.fb.nonNullable.control(''),
    from: this.fb.control<Date | null>(null),
    to: this.fb.control<Date | null>(null),
  });

  ngOnInit(): void {
    this.api.getClients().subscribe((c) => (this.clients = c));
    this.load();
  }

  load(): void {
    const v = this.filters.getRawValue();
    this.api
      .getInvoices({
        status: v.status,
        clientId: v.clientId || undefined,
        from: v.from ? this.toIsoDate(v.from) : undefined,
        to: v.to ? this.toIsoDate(v.to) : undefined,
      })
      .subscribe((rows) => (this.invoices = rows));
  }

  private toIsoDate(value: Date): string {
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
