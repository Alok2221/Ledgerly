export type InvoiceStatus = 'DRAFT' | 'SENT' | 'PAID' | 'CANCELLED';

export interface AuthResponse {
  token: string;
  userId: string;
  email: string;
  displayName: string;
}

export interface Client {
  id: string;
  name: string;
  nip?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id?: string;
  description: string;
  quantity: number;
  unitNetPrice: number;
  vatRate: number;
  lineNet?: number;
  lineVat?: number;
  lineGross?: number;
}

export interface Invoice {
  id: string;
  number: string;
  status: InvoiceStatus;
  clientId: string;
  clientName: string;
  issueDate: string;
  dueDate: string;
  netTotal: number;
  vatTotal: number;
  grossTotal: number;
  notes?: string | null;
  items: InvoiceItem[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  fromDate: string;
  toDate: string;
  issuedGross: number;
  paidGross: number;
  outstandingGross: number;
  upcomingDue: {
    id: string;
    number: string;
    clientName: string;
    dueDate: string;
    grossTotal: number;
  }[];
}
