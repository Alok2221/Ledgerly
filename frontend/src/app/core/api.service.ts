import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Client, DashboardSummary, Invoice, InvoiceStatus } from '../models/models';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient) {}

  getClients(q?: string) {
    let params = new HttpParams();
    if (q) params = params.set('q', q);
    return this.http.get<Client[]>(`${environment.apiUrl}/api/clients`, { params });
  }

  createClient(body: Partial<Client>) {
    return this.http.post<Client>(`${environment.apiUrl}/api/clients`, body);
  }

  updateClient(id: string, body: Partial<Client>) {
    return this.http.put<Client>(`${environment.apiUrl}/api/clients/${id}`, body);
  }

  deleteClient(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/api/clients/${id}`);
  }

  getInvoices(filters: {
    status?: InvoiceStatus | '';
    clientId?: string;
    from?: string;
    to?: string;
  } = {}) {
    let params = new HttpParams();
    if (filters.status) params = params.set('status', filters.status);
    if (filters.clientId) params = params.set('clientId', filters.clientId);
    if (filters.from) params = params.set('from', filters.from);
    if (filters.to) params = params.set('to', filters.to);
    return this.http.get<Invoice[]>(`${environment.apiUrl}/api/invoices`, { params });
  }

  getInvoice(id: string) {
    return this.http.get<Invoice>(`${environment.apiUrl}/api/invoices/${id}`);
  }

  createInvoice(body: unknown) {
    return this.http.post<Invoice>(`${environment.apiUrl}/api/invoices`, body);
  }

  updateInvoice(id: string, body: unknown) {
    return this.http.put<Invoice>(`${environment.apiUrl}/api/invoices/${id}`, body);
  }

  changeInvoiceStatus(id: string, status: InvoiceStatus) {
    return this.http.put<Invoice>(`${environment.apiUrl}/api/invoices/${id}/status`, { status });
  }

  deleteInvoice(id: string) {
    return this.http.delete<void>(`${environment.apiUrl}/api/invoices/${id}`);
  }

  getDashboard(from?: string, to?: string) {
    let params = new HttpParams();
    if (from) params = params.set('from', from);
    if (to) params = params.set('to', to);
    return this.http.get<DashboardSummary>(`${environment.apiUrl}/api/dashboard/summary`, { params });
  }
}
