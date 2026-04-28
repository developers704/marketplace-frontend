const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

export type SpecialOrderPayload = {
  receiptNumber?: string;
  customerNumber?: string;
  typeOfRequest: string;
  eta?: string;
  referenceSkuNumber?: string;
  metalQuality: string;
  diamondType: string;
  diamondColor?: string;
  diamondClarity?: string;
  diamondDetails?: string;
  customization?: string;
  notes?: string;
};

export type SpoChatMessage = {
  _id: string;
  text: string;
  role: 'user' | 'admin';
  senderId?: string;
  senderName?: string;
  replyToMessageId?: string | null;
  replyToText?: string;
  replyToSenderName?: string;
  createdAt: string;
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
  chatMessages?: SpoChatMessage[];
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
  form.append('eta', payload.eta || '');
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

export async function getSpecialOrderById(id: string): Promise<SpecialOrder> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/special-orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to fetch order');
  return json.data;
}

export async function getSpoChatMessages(orderId: string): Promise<SpoChatMessage[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/special-orders/${orderId}/chat-messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to load chat');
  return json.data || [];
}

export async function postSpoChatMessage(
  orderId: string,
  text: string,
  replyToMessageId?: string
): Promise<SpoChatMessage> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/special-orders/${orderId}/chat-messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      replyToMessageId: replyToMessageId || null,
    }),
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Failed to send message');
  return json.data;
}

export async function finalizeSpecialOrder(orderId: string): Promise<SpecialOrder> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/special-orders/${orderId}/finalize`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!res.ok) throw new Error(json.message || 'Could not finalize order');
  return json.data;
}

/** User-facing status label (CLOSED shown as Delivered). */
export function spoStatusLabel(status: string): string {
  const map: Record<string, string> = {
    SUBMITTED: 'Submitted',
    RECEIVED_BY_SPO_TEAM: 'Received by SPO team',
    WIP: 'WIP',
    COMPLETED: 'Completed',
    CLOSED: 'Delivered',
    FINALIZED: 'Finalized',
  };
  return map[status] || status.replace(/_/g, ' ');
}
