import { Component, OnInit, inject } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import {
  FormArray,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ApiService } from '../../core/api.service';
import { Client, Invoice, InvoiceStatus } from '../../models/models';

@Component({
  selector: 'app-invoice-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    CurrencyPipe,
  ],
  template: `
    <div class="header">
      <div>
        <h1>{{ isNew ? 'New invoice' : invoice?.number }}</h1>
        <p class="muted">
          @if (invoice) {
            Status: <strong>{{ invoice.status }}</strong>
          } @else {
            Draft — number is assigned automatically on save
          }
        </p>
      </div>
      <a mat-button routerLink="/invoices">Back to list</a>
    </div>

    <form [formGroup]="form" (ngSubmit)="save()">
      <div class="grid">
        <mat-form-field appearance="outline">
          <mat-label>Client</mat-label>
          <mat-select formControlName="clientId">
            @for (c of clients; track c.id) {
              <mat-option [value]="c.id">{{ c.name }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Issue date</mat-label>
          <input matInput type="date" formControlName="issueDate" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Due date</mat-label>
          <input matInput type="date" formControlName="dueDate" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Notes</mat-label>
          <input matInput formControlName="notes" />
        </mat-form-field>
      </div>

      <div class="items-head">
        <h2>Line items</h2>
        <button mat-stroked-button type="button" (click)="addItem()" [disabled]="!canEdit">
          <mat-icon>add</mat-icon> Add item
        </button>
      </div>

      <div formArrayName="items" class="items">
        @for (item of items.controls; track $index; let i = $index) {
          <div class="item" [formGroupName]="i">
            <mat-form-field appearance="outline" class="desc">
              <mat-label>Description</mat-label>
              <input matInput formControlName="description" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Qty</mat-label>
              <input matInput type="number" step="0.001" formControlName="quantity" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Unit net</mat-label>
              <input matInput type="number" step="0.01" formControlName="unitNetPrice" />
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>VAT %</mat-label>
              <input matInput type="number" step="0.01" formControlName="vatRate" />
            </mat-form-field>
            <button mat-icon-button type="button" (click)="removeItem(i)" [disabled]="!canEdit || items.length === 1">
              <mat-icon>delete</mat-icon>
            </button>
          </div>
        }
      </div>

      <div class="totals">
        <div>Net: <strong>{{ previewNet | currency: 'PLN' }}</strong></div>
        <div>VAT: <strong>{{ previewVat | currency: 'PLN' }}</strong></div>
        <div>Gross: <strong>{{ previewGross | currency: 'PLN' }}</strong></div>
      </div>

      @if (error) {
        <p class="error">{{ error }}</p>
      }

      <div class="actions">
        @if (canEdit) {
          <button mat-flat-button color="primary" [disabled]="form.invalid || saving">Save</button>
        }
        @if (invoice?.status === 'DRAFT') {
          <button mat-stroked-button type="button" (click)="setStatus('SENT')">Mark as SENT</button>
          <button mat-button type="button" color="warn" (click)="remove()">Delete draft</button>
        }
        @if (invoice?.status === 'SENT') {
          <button mat-flat-button color="primary" type="button" (click)="setStatus('PAID')">Mark as PAID</button>
          <button mat-button type="button" color="warn" (click)="setStatus('CANCELLED')">Cancel</button>
        }
      </div>
    </form>
  `,
  styles: `
    .header { display: flex; justify-content: space-between; gap: 1rem; margin-bottom: 1rem; }
    h1, h2 { margin: 0 0 0.35rem; }
    .muted { margin: 0; color: color-mix(in srgb, var(--mat-sys-on-surface) 65%, transparent); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .items-head { display: flex; justify-content: space-between; align-items: center; margin: 1.25rem 0 0.5rem; }
    .item { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 0.5rem; align-items: start; }
    .totals { display: flex; gap: 1.5rem; margin: 1rem 0; flex-wrap: wrap; }
    .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; }
    .error { color: #b3261e; }
    @media (max-width: 900px) {
      .grid, .item { grid-template-columns: 1fr; }
    }
  `,
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clients: Client[] = [];
  invoice: Invoice | null = null;
  isNew = true;
  saving = false;
  error = '';

  form = this.fb.nonNullable.group({
    clientId: ['', Validators.required],
    issueDate: [this.today(), Validators.required],
    dueDate: [this.todayPlus(14), Validators.required],
    notes: [''],
    items: this.fb.array([this.createItem()]),
  });

  get items(): FormArray {
    return this.form.get('items') as FormArray;
  }

  get canEdit(): boolean {
    return this.isNew || this.invoice?.status === 'DRAFT';
  }

  get previewNet(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const v = ctrl.getRawValue();
      return sum + Number(v.quantity || 0) * Number(v.unitNetPrice || 0);
    }, 0);
  }

  get previewVat(): number {
    return this.items.controls.reduce((sum, ctrl) => {
      const v = ctrl.getRawValue();
      const net = Number(v.quantity || 0) * Number(v.unitNetPrice || 0);
      return sum + (net * Number(v.vatRate || 0)) / 100;
    }, 0);
  }

  get previewGross(): number {
    return this.previewNet + this.previewVat;
  }

  ngOnInit(): void {
    this.api.getClients().subscribe((c) => (this.clients = c));
    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.isNew = true;
      return;
    }
    this.isNew = false;
    this.api.getInvoice(id).subscribe((invoice) => {
      this.invoice = invoice;
      this.form.patchValue({
        clientId: invoice.clientId,
        issueDate: invoice.issueDate,
        dueDate: invoice.dueDate,
        notes: invoice.notes || '',
      });
      this.items.clear();
      invoice.items.forEach((item) =>
        this.items.push(
          this.createItem({
            description: item.description,
            quantity: item.quantity,
            unitNetPrice: item.unitNetPrice,
            vatRate: item.vatRate,
          }),
        ),
      );
      if (!this.canEdit) {
        this.form.disable();
      }
    });
  }

  addItem(): void {
    this.items.push(this.createItem());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  save(): void {
    if (this.form.invalid || !this.canEdit) return;
    this.saving = true;
    this.error = '';
    const raw = this.form.getRawValue();
    const body = {
      clientId: raw.clientId,
      issueDate: raw.issueDate,
      dueDate: raw.dueDate,
      notes: raw.notes || null,
      items: raw.items.map((i) => ({
        description: i.description,
        quantity: Number(i.quantity),
        unitNetPrice: Number(i.unitNetPrice),
        vatRate: Number(i.vatRate),
      })),
    };
    const req = this.isNew
      ? this.api.createInvoice(body)
      : this.api.updateInvoice(this.invoice!.id, body);
    req.subscribe({
      next: (invoice) => {
        this.saving = false;
        this.router.navigate(['/invoices', invoice.id]);
        this.invoice = invoice;
        this.isNew = false;
      },
      error: (err) => {
        this.saving = false;
        this.error = err?.error?.message || 'Could not save invoice';
      },
    });
  }

  setStatus(status: InvoiceStatus): void {
    if (!this.invoice) return;
    this.api.changeInvoiceStatus(this.invoice.id, status).subscribe({
      next: (invoice) => {
        this.invoice = invoice;
        if (!this.canEdit) this.form.disable();
      },
      error: (err) => (this.error = err?.error?.message || 'Could not change status'),
    });
  }

  remove(): void {
    if (!this.invoice || !confirm('Delete this draft invoice?')) return;
    this.api.deleteInvoice(this.invoice.id).subscribe({
      next: () => this.router.navigateByUrl('/invoices'),
      error: (err) => (this.error = err?.error?.message || 'Could not delete invoice'),
    });
  }

  private createItem(
    value: { description: string; quantity: number; unitNetPrice: number; vatRate: number } = {
      description: '',
      quantity: 1,
      unitNetPrice: 0,
      vatRate: 23,
    },
  ) {
    return this.fb.nonNullable.group({
      description: [value.description, Validators.required],
      quantity: [value.quantity, [Validators.required, Validators.min(0.001)]],
      unitNetPrice: [value.unitNetPrice, [Validators.required, Validators.min(0)]],
      vatRate: [value.vatRate, [Validators.required, Validators.min(0)]],
    });
  }

  private today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private todayPlus(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }
}
