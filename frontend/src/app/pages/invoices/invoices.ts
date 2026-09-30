import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { ApiService } from '../../core/api.service';
import { Client, Invoice, InvoiceStatus } from '../../models/models';

@Component({
  selector: 'app-invoices',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    CurrencyPipe,
    DatePipe,
  ],
  template: `
    <div class="header">
      <div>
        <h1>Invoices</h1>
        <p class="muted">Filter by status, client and issue date</p>
      </div>
      <a mat-flat-button color="primary" routerLink="/invoices/new">New invoice</a>
    </div>

    <form class="filters" [formGroup]="filters" (ngSubmit)="load()">
      <mat-form-field appearance="outline">
        <mat-label>Status</mat-label>
        <mat-select formControlName="status">
          <mat-option value="">All</mat-option>
          <mat-option value="DRAFT">DRAFT</mat-option>
          <mat-option value="SENT">SENT</mat-option>
          <mat-option value="PAID">PAID</mat-option>
          <mat-option value="CANCELLED">CANCELLED</mat-option>
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>Client</mat-label>
        <mat-select formControlName="clientId">
          <mat-option value="">All</mat-option>
          @for (c of clients; track c.id) {
            <mat-option [value]="c.id">{{ c.name }}</mat-option>
          }
        </mat-select>
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>From</mat-label>
        <input matInput type="date" formControlName="from" />
      </mat-form-field>
      <mat-form-field appearance="outline">
        <mat-label>To</mat-label>
        <input matInput type="date" formControlName="to" />
      </mat-form-field>
      <button mat-stroked-button type="submit">Apply</button>
    </form>

    <table mat-table [dataSource]="invoices" class="full">
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
      <ng-container matColumnDef="status">
        <th mat-header-cell *matHeaderCellDef>Status</th>
        <td mat-cell *matCellDef="let row"><span class="status" [attr.data-s]="row.status">{{ row.status }}</span></td>
      </ng-container>
      <ng-container matColumnDef="issueDate">
        <th mat-header-cell *matHeaderCellDef>Issued</th>
        <td mat-cell *matCellDef="let row">{{ row.issueDate | date: 'yyyy-MM-dd' }}</td>
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
  `,
  styles: `
    .header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    h1 { margin: 0 0 0.35rem; }
    .muted { margin: 0; color: color-mix(in srgb, var(--mat-sys-on-surface) 65%, transparent); }
    .filters { display: flex; flex-wrap: wrap; gap: 0.75rem; align-items: center; margin-bottom: 1rem; }
    .full { width: 100%; }
    a { color: inherit; }
    .status { font-size: 0.8rem; font-weight: 600; }
    .status[data-s='DRAFT'] { color: #5f6368; }
    .status[data-s='SENT'] { color: #0b57d0; }
    .status[data-s='PAID'] { color: #146c2e; }
    .status[data-s='CANCELLED'] { color: #b3261e; }
  `,
})
export class InvoicesComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  invoices: Invoice[] = [];
  clients: Client[] = [];
  cols = ['number', 'clientName', 'status', 'issueDate', 'dueDate', 'grossTotal'];
  filters = this.fb.nonNullable.group({
    status: ['' as InvoiceStatus | ''],
    clientId: [''],
    from: [''],
    to: [''],
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
        from: v.from || undefined,
        to: v.to || undefined,
      })
      .subscribe((rows) => (this.invoices = rows));
  }
}
