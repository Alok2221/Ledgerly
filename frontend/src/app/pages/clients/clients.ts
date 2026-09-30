import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Client } from '../../models/models';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  template: `
    <div class="header">
      <div>
        <h1>Clients</h1>
        <p class="muted">Clients linked to your account</p>
      </div>
    </div>

    <mat-form-field appearance="outline" class="search">
      <mat-label>Search by name</mat-label>
      <input matInput [formControl]="searchCtrl" />
    </mat-form-field>

    <form class="form" [formGroup]="form" (ngSubmit)="save()">
      <h2>{{ editingId ? 'Edit client' : 'New client' }}</h2>
      <div class="grid">
        <mat-form-field appearance="outline">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Tax ID (NIP)</mat-label>
          <input matInput formControlName="nip" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Email</mat-label>
          <input matInput formControlName="email" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Address</mat-label>
          <input matInput formControlName="address" />
        </mat-form-field>
      </div>
      <div class="actions">
        <button mat-flat-button color="primary" [disabled]="form.invalid">
          {{ editingId ? 'Save' : 'Add' }}
        </button>
        @if (editingId) {
          <button mat-button type="button" (click)="resetForm()">Cancel</button>
        }
      </div>
      @if (error) {
        <p class="error">{{ error }}</p>
      }
    </form>

    <table mat-table [dataSource]="clients" class="full">
      <ng-container matColumnDef="name">
        <th mat-header-cell *matHeaderCellDef>Name</th>
        <td mat-cell *matCellDef="let row">{{ row.name }}</td>
      </ng-container>
      <ng-container matColumnDef="nip">
        <th mat-header-cell *matHeaderCellDef>NIP</th>
        <td mat-cell *matCellDef="let row">{{ row.nip || '—' }}</td>
      </ng-container>
      <ng-container matColumnDef="email">
        <th mat-header-cell *matHeaderCellDef>Email</th>
        <td mat-cell *matCellDef="let row">{{ row.email || '—' }}</td>
      </ng-container>
      <ng-container matColumnDef="actions">
        <th mat-header-cell *matHeaderCellDef></th>
        <td mat-cell *matCellDef="let row">
          <button mat-icon-button type="button" (click)="edit(row)" aria-label="Edit">
            <mat-icon>edit</mat-icon>
          </button>
          <button mat-icon-button type="button" (click)="remove(row)" aria-label="Delete">
            <mat-icon>delete</mat-icon>
          </button>
        </td>
      </ng-container>
      <tr mat-header-row *matHeaderRowDef="cols"></tr>
      <tr mat-row *matRowDef="let row; columns: cols"></tr>
    </table>
  `,
  styles: `
    .header { margin-bottom: 1rem; }
    h1, h2 { margin: 0 0 0.35rem; }
    .muted { color: color-mix(in srgb, var(--mat-sys-on-surface) 65%, transparent); margin: 0; }
    .search { width: min(360px, 100%); }
    .form { margin: 1rem 0 1.5rem; padding: 1rem; border: 1px solid color-mix(in srgb, var(--mat-sys-outline) 40%, transparent); border-radius: 12px; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .actions { display: flex; gap: 0.5rem; }
    .full { width: 100%; }
    .error { color: #b3261e; }
    @media (max-width: 800px) { .grid { grid-template-columns: 1fr; } }
  `,
})
export class ClientsComponent implements OnInit {
  private api = inject(ApiService);
  private fb = inject(FormBuilder);

  clients: Client[] = [];
  cols = ['name', 'nip', 'email', 'actions'];
  editingId: string | null = null;
  error = '';
  searchCtrl = this.fb.nonNullable.control('');
  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    nip: [''],
    email: [''],
    address: [''],
  });

  ngOnInit(): void {
    this.load();
    this.searchCtrl.valueChanges.pipe(debounceTime(250), distinctUntilChanged()).subscribe((q) => this.load(q));
  }

  load(q?: string): void {
    this.api.getClients(q).subscribe((clients) => (this.clients = clients));
  }

  edit(client: Client): void {
    this.editingId = client.id;
    this.form.setValue({
      name: client.name,
      nip: client.nip || '',
      email: client.email || '',
      address: client.address || '',
    });
  }

  resetForm(): void {
    this.editingId = null;
    this.form.reset({ name: '', nip: '', email: '', address: '' });
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
        this.resetForm();
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
