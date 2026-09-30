import { Component, OnInit, inject } from '@angular/core';
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
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { ApiService } from '../../core/api.service';
import { CurrencyService } from '../../core/currency.service';
import { Client, Invoice, InvoiceStatus } from '../../models/models';
import { MoneyPipe } from '../../shared/money.pipe';

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
    MatDatepickerModule,
    MoneyPipe,
  ],
  providers: [provideNativeDateAdapter()],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <a class="back-link" routerLink="/invoices">← Back to invoices</a>
          <p class="page-kicker">
            @if (invoice) {
              Status · {{ invoice.status }}
            } @else {
              Draft will get a number on save
            }
          </p>
          <h1>{{ isNew ? 'New invoice' : invoice?.number }}</h1>
        </div>
      </header>

      <form class="panel" [formGroup]="form" (ngSubmit)="save()">
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
            <input matInput [matDatepicker]="issuePicker" formControlName="issueDate" readonly />
            <mat-datepicker-toggle matSuffix [for]="issuePicker" aria-label="Open issue date calendar"></mat-datepicker-toggle>
            <mat-datepicker #issuePicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Due date</mat-label>
            <input matInput [matDatepicker]="duePicker" formControlName="dueDate" readonly />
            <mat-datepicker-toggle matSuffix [for]="duePicker" aria-label="Open due date calendar"></mat-datepicker-toggle>
            <mat-datepicker #duePicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Notes</mat-label>
            <input matInput formControlName="notes" />
          </mat-form-field>
        </div>

        <div class="items-head">
          <h2>Line items</h2>
          <button mat-stroked-button type="button" (click)="addItem()" [disabled]="!canEdit">
            <mat-icon>add</mat-icon>
            Add item
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
              <button
                mat-icon-button
                type="button"
                (click)="removeItem(i)"
                [disabled]="!canEdit || items.length === 1"
                aria-label="Remove line"
              >
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>

        <div class="totals">
          <div><span>Net</span><strong>{{ previewNet | money }}</strong></div>
          <div><span>VAT</span><strong>{{ previewVat | money }}</strong></div>
          <div><span>Gross</span><strong>{{ previewGross | money }}</strong></div>
        </div>
        @if (currency.rateLabel()) {
          <p class="fx-note">{{ currency.rateLabel() }}</p>
        }

        @if (error) {
          <p class="error">{{ error }}</p>
        }

        <div class="form-actions">
          @if (canEdit) {
            <button mat-flat-button class="btn-primary" [disabled]="form.invalid || saving">Save invoice</button>
          }
          @if (invoice?.status === 'DRAFT') {
            <button mat-stroked-button type="button" (click)="setStatus('SENT')">Mark as SENT</button>
            <button mat-button type="button" color="warn" (click)="remove()">Delete draft</button>
          }
          @if (invoice?.status === 'SENT') {
            <button mat-flat-button class="btn-accent" type="button" (click)="setStatus('PAID')">Mark as PAID</button>
            <button mat-button type="button" color="warn" (click)="setStatus('CANCELLED')">Cancel invoice</button>
          }
          <a mat-button routerLink="/invoices">Back to list</a>
        </div>
      </form>
    </div>
  `,
  styles: `
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2) var(--space-3);
    }
    .items-head {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
      margin: var(--space-5) 0 var(--space-2);
    }
    .items-head h2 {
      margin: 0;
      font-family: var(--font-display);
      font-size: clamp(1.1rem, 1rem + 0.8vw, 1.25rem);
    }
    .item {
      display: grid;
      grid-template-columns: minmax(0, 2fr) repeat(3, minmax(0, 1fr)) auto;
      gap: var(--space-2);
      align-items: start;
      padding-bottom: var(--space-2);
      margin-bottom: var(--space-2);
      border-bottom: 1px dashed var(--line);
    }
    .item:last-child {
      border-bottom: 0;
      margin-bottom: 0;
    }
    .item .mat-mdc-form-field,
    .grid .mat-mdc-form-field {
      width: 100%;
    }
    .totals {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: var(--space-2);
      margin: var(--space-3) 0 var(--space-1);
    }
    .totals div {
      min-width: 0;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      background: color-mix(in srgb, var(--ink) 4%, transparent);
      border: 1px solid var(--line);
    }
    .totals span {
      display: block;
      color: var(--muted);
      font-size: 0.74rem;
      font-weight: 650;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      margin-bottom: 0.2rem;
    }
    .totals strong {
      display: block;
      font-family: var(--font-display);
      font-size: clamp(1.05rem, 0.95rem + 0.8vw, 1.25rem);
      overflow-wrap: anywhere;
    }
    .fx-note {
      margin: 0 0 var(--space-2);
      color: var(--muted);
      font-size: 0.82rem;
    }
    .error { color: var(--warn); }
    @media (max-width: 900px) {
      .grid { grid-template-columns: 1fr; }
      .item {
        grid-template-columns: 1fr 1fr;
        padding: var(--space-3);
        border: 1px solid var(--line);
        border-radius: 12px;
        background: color-mix(in srgb, var(--panel) 80%, transparent);
      }
      .item .desc { grid-column: 1 / -1; }
      .item button { justify-self: end; grid-column: 1 / -1; }
      .totals { grid-template-columns: 1fr; }
      .items-head > button { width: 100%; }
      .form-actions > * { flex: 1 1 auto; }
    }
  `,
})
export class InvoiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  currency = inject(CurrencyService);

  clients: Client[] = [];
  invoice: Invoice | null = null;
  isNew = true;
  saving = false;
  error = '';

  form = this.fb.nonNullable.group({
    clientId: ['', Validators.required],
    issueDate: [this.todayDate(), Validators.required],
    dueDate: [this.todayPlusDate(14), Validators.required],
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
        issueDate: this.parseDate(invoice.issueDate),
        dueDate: this.parseDate(invoice.dueDate),
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
      if (!this.canEdit) this.form.disable();
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
      issueDate: this.toIsoDate(raw.issueDate),
      dueDate: this.toIsoDate(raw.dueDate),
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

  private todayDate(): Date {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }

  private todayPlusDate(days: number): Date {
    const d = this.todayDate();
    d.setDate(d.getDate() + days);
    return d;
  }

  private parseDate(value: string): Date {
    const [y, m, day] = value.split('-').map(Number);
    return new Date(y, m - 1, day);
  }

  private toIsoDate(value: Date | string): string {
    if (typeof value === 'string') return value.slice(0, 10);
    const y = value.getFullYear();
    const m = String(value.getMonth() + 1).padStart(2, '0');
    const d = String(value.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}
