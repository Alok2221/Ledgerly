import { Routes } from '@angular/router';
import { authGuard } from './core/auth.guard';
import { ShellComponent } from './layout/shell';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { ClientsComponent } from './pages/clients/clients';
import { InvoicesComponent } from './pages/invoices/invoices';
import { InvoiceFormComponent } from './pages/invoice-form/invoice-form';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: '',
    component: ShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'clients', component: ClientsComponent },
      { path: 'invoices', component: InvoicesComponent },
      { path: 'invoices/new', component: InvoiceFormComponent },
      { path: 'invoices/:id', component: InvoiceFormComponent },
    ],
  },
  { path: '**', redirectTo: 'dashboard' },
];
