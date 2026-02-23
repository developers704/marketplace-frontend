const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

export type SpecialOrderPayload = {
  receiptNumber?: string;
  customerNumber?: string;
  typeOfRequest: string;
  referenceSkuNumber?: string;
  metalQuality: string;
  diamondType: string;
  diamondColor?: string;
  diamondClarity?: string;
  diamondDetails?: string;
  customization?: string;
  notes?: string;
};

export type SpecialOrder = {
  _id: string;
  ticketNumber: string;
  receiptNumber: string;
  storeId: { _id: string; name: string };
  assignedTo: string | null;
  customerNumber: string;
  typeOfRequest: string;
  referenceSkuNumber: string;
  metalQuality: string;
  diamondType: string;
  diamondColor: string;
  diamondClarity: string;
  diamondDetails: string;
  customization: string;
  attachments: string[];
  canvasDrawing?: string;
  status: string;
  notes: string;
  eta: string | null;
  createdAt: string;
  updatedAt: string;
};

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

export async function createSpecialOrder(
  payload: SpecialOrderPayload,
  files?: File[],
  canvasDrawing?: File | null
): Promise<{ data: SpecialOrder; ticketNumber: string }> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const form = new FormData();
  form.append('receiptNumber', payload.receiptNumber || '');
  form.append('customerNumber', payload.customerNumber || '');
  form.append('typeOfRequest', payload.typeOfRequest);
  form.append('referenceSkuNumber', payload.referenceSkuNumber || '');
  form.append('metalQuality', payload.metalQuality);
  form.append('diamondType', payload.diamondType);
  form.append('diamondColor', payload.diamondColor || '');
  form.append('diamondClarity', payload.diamondClarity || '');
  form.append('diamondDetails', payload.diamondDetails || '');
  form.append('customization', payload.customization || '');
  form.append('notes', payload.notes || '');

  if (files?.length) {
    files.forEach((f) => form.append('attachments', f));
  }

  if (canvasDrawing) {
    form.append('canvasDrawing', canvasDrawing, 'canvas-drawing.png');
  }

  const res = await fetch(`${BASE_API}/api/special-orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to submit special order');
  return json;
}

export async function getMySpecialOrders(): Promise<SpecialOrder[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/special-orders`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch orders');
  return json.data || [];
}
