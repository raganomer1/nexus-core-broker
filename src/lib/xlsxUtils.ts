import * as XLSX from 'xlsx';
import type { Client, Lead, PaymentRequest } from '@/types';

// ===================== EXPORT =====================

export function exportClientsToXlsx(clients: Client[]) {
  const data = clients.map(c => ({
    'Фамилия': c.lastName,
    'Имя': c.firstName,
    'Email': c.email,
    'Телефон': c.phone || '',
    'Страна': c.country || '',
    'Тип': c.type,
    'Статус': c.status,
    'Верификация': c.verificationStatus,
    'Источник': c.source || '',
    'Создан': new Date(c.createdAt).toLocaleDateString(),
  }));
  downloadXlsx(data, 'clients');
}

export function exportLeadsToXlsx(leads: Lead[]) {
  const data = leads.map(l => ({
    'Фамилия': l.lastName,
    'Имя': l.firstName,
    'Email': l.email,
    'Телефон': l.phone || '',
    'Страна': l.country || '',
    'Статус': l.status,
    'Источник': l.source || '',
    'Создан': new Date(l.createdAt).toLocaleDateString(),
  }));
  downloadXlsx(data, 'leads');
}

function downloadXlsx(data: Record<string, string>[], name: string) {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, name);
  XLSX.writeFile(wb, `${name}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

// ===================== IMPORT =====================

export function parseXlsxFile(file: File): Promise<Record<string, string>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const wb = XLSX.read(e.target?.result, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: '' });
        resolve(rows);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

// Map Russian/English column headers to Client fields
const clientFieldMap: Record<string, keyof Client> = {
  'фамилия': 'lastName', 'lastname': 'lastName', 'last_name': 'lastName',
  'имя': 'firstName', 'firstname': 'firstName', 'first_name': 'firstName',
  'email': 'email', 'почта': 'email',
  'телефон': 'phone', 'phone': 'phone',
  'страна': 'country', 'country': 'country',
  'тип': 'type', 'type': 'type',
  'статус': 'status', 'status': 'status',
  'источник': 'source', 'source': 'source',
};

const leadFieldMap: Record<string, keyof Lead> = {
  'фамилия': 'lastName', 'lastname': 'lastName', 'last_name': 'lastName',
  'имя': 'firstName', 'firstname': 'firstName', 'first_name': 'firstName',
  'email': 'email', 'почта': 'email',
  'телефон': 'phone', 'phone': 'phone',
  'страна': 'country', 'country': 'country',
  'статус': 'status', 'status': 'status',
  'источник': 'source', 'source': 'source',
};

export function mapRowsToClients(rows: Record<string, string>[]): Partial<Client>[] {
  return rows.map(row => {
    const client: Record<string, string> = {};
    for (const [col, val] of Object.entries(row)) {
      const key = clientFieldMap[col.toLowerCase().trim()];
      if (key) client[key] = String(val).trim();
    }
    return client as Partial<Client>;
  }).filter(c => c.lastName && c.email);
}

export function mapRowsToLeads(rows: Record<string, string>[]): Partial<Lead>[] {
  return rows.map(row => {
    const lead: Record<string, string> = {};
    for (const [col, val] of Object.entries(row)) {
      const key = leadFieldMap[col.toLowerCase().trim()];
      if (key) lead[key] = String(val).trim();
    }
    return lead as Partial<Lead>;
  }).filter(l => l.lastName && l.email);
}
