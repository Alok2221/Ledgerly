import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  template: `
    <div class="page">
      <header class="page-head">
        <div>
          <p class="page-kicker">Your book of business</p>
          <h1>Clients</h1>
        </div>
        <button mat-flat-button class="btn-accent" type="button" (click)="startCreate()">
          Add client
        </button>
      </header>

      <mat-form-field appearance="outline" class="search full-field">
        <mat-label>Search by name</mat-label>
        <input matInput [formControl]="searchCtrl" />
      </mat-form-field>

      @if (showForm) {
        <section class="panel form-panel">
          <a class="back-link" href="#" (click)="cancelForm($event)">← Close form</a>
          <h2>{{ editingId ? 'Edit client' : 'New client' }}</h2>
          <form [formGroup]="form" (ngSubmit)="save()">
            <div class="grid">
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Name</mat-label>
                <input matInput formControlName="name" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Tax ID (NIP)</mat-label>
                <input matInput formControlName="nip" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Email</mat-label>
                <input matInput formControlName="email" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-field">
                <mat-label>Phone (optional)</mat-label>
                <input matInput formControlName="phone" autocomplete="tel" />
              </mat-form-field>
              <mat-form-field appearance="outline" class="full-field address">
                <mat-label>Address</mat-label>
                <input matInput formControlName="address" />
              </mat-form-field>
            </div>
            @if (error) {
              <p class="error">{{ error }}</p>
            }
            <div class="form-actions">
              <button mat-flat-button class="btn-primary" [disabled]="form.invalid">
                {{ editingId ? 'Save changes' : 'Save client' }}
              </button>
              <button mat-button type="button" (click)="cancelForm($event)">Cancel</button>
            </div>
          </form>
        </section>
      }

      <div class="table-wrap desktop-only">
        <table class="ledger-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>NIP</th>
              <th>Email</th>
              <th>Phone</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (row of clients; track row.id) {
              <tr>
                <td>{{ row.name }}</td>
                <td>{{ row.nip || '-' }}</td>
                <td>{{ row.email || '-' }}</td>
                <td>{{ row.phone || '-' }}</td>
                <td class="row-actions">
                  <button mat-button type="button" (click)="edit(row)">Edit</button>
                  <button mat-button type="button" color="warn" (click)="remove(row)">Delete</button>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <div class="mobile-list mobile-only">
        @for (row of clients; track row.id) {
          <article class="mobile-card">
            <div class="card-top">
              <div class="card-title">{{ row.name }}</div>
            </div>
            <div class="card-meta">
              <span>NIP · {{ row.nip || '-' }}</span>
              <span>{{ row.email || 'No email' }}</span>
              @if (row.phone) {
                <span>{{ row.phone }}</span>
              }
            </div>
            <div class="card-actions">
              <button mat-stroked-button type="button" (click)="edit(row)">Edit</button>
              <button mat-button type="button" color="warn" (click)="remove(row)">Delete</button>
            </div>
          </article>
        }
      </div>
    </div>
  `,
  styles: `
    .search { width: min(22rem, 100%); margin-bottom: var(--space-3); }
    .form-panel { margin-bottom: var(--space-4); }
    .form-panel h2 {
      margin: 0 0 var(--space-3);
      font-family: var(--font-display);
      font-size: clamp(1.15rem, 1rem + 1vw, 1.35rem);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2) var(--space-3);
    }
    .address { grid-column: 1 / -1; }
    .error { color: var(--warn); }
    .row-actions { white-space: nowrap; text-align: right; }
    @media (max-width: 800px) {
      .search { width: 100%; }
      .grid { grid-template-columns: 1fr; }
      .address { grid-column: auto; }
    }
  `,
})
export class ClientsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  clients: Client[] = [];
  editingId: string | null = null;
  showForm = false;
  error = '';
  searchCtrl = this.fb.nonNullable.control('');
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    nip: [''],
    email: [''],
    phone: [''],
    address: [''],
  });

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe((q) => this.load(q));
  }

  load(q?: string): void {
    this.api.getClients(q).subscribe((clients) => (this.clients = clients));
  }

  startCreate(): void {
    this.editingId = null;
    this.form.reset({ name: '', nip: '', email: '', phone: '', address: '' });
    this.error = '';
    this.showForm = true;
  }

  edit(client: Client): void {
    this.editingId = client.id;
    this.form.setValue({
      name: client.name,
      nip: client.nip || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    });
    this.error = '';
    this.showForm = true;
  }

  cancelForm(event?: Event): void {
    event?.preventDefault();
    this.showForm = false;
    this.editingId = null;
    this.error = '';
  }

  save(): void {
    if (this.form.invalid) return;
    this.error = '';
    const body = this.form.getRawValue();
    const req = this.editingId
      ? this.api.updateClient(this.editingId, body)
      : this.api.createClient(body);
    req.subscribe({
      next: () => {
        this.cancelForm();
        this.load(this.searchCtrl.value);
      },
      error: (err) => (this.error = err?.error?.message || 'Could not save client'),
    });
  }

  remove(client: Client): void {
    if (!confirm(`Delete client "${client.name}"?`)) return;
    this.api.deleteClient(client.id).subscribe({
      next: () => this.load(this.searchCtrl.value),
      error: (err) => (this.error = err?.error?.message || 'Could not delete client'),
    });
  }
}
