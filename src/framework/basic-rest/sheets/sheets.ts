const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

export type SheetCategory = {
  _id: string;
  title: string;
  googleSheetUrl: string;
  allowedUsers?: string[];
  createdBy?: { _id?: string; username?: string; email?: string };
  createdAt: string;
  updatedAt?: string;
};

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

export async function getMySheets(): Promise<SheetCategory[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/sheets/my`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Failed to load sheets');
  return json?.data || [];
}

export async function getSheetById(id: string): Promise<SheetCategory> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/sheets/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json?.message || 'Failed to load sheet');
  return json?.data;
}
