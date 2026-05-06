const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

export type B2bStoChatMessage = {
  _id: string;
  text: string;
  role: 'user' | 'admin';
  senderName?: string;
  createdAt?: string;
  replyToMessageId?: string | null;
  replyToText?: string;
  replyToSenderName?: string;
};

/** Populated SKU from store transfer APIs (fields vary by catalog) */
export type B2bStoreTransferSku = {
  _id?: string;
  sku?: string;
  price?: number;
  images?: string[];
  metalType?: string;
  metalColor?: string;
  size?: string;
  attributes?: Record<string, string | number | undefined | null>;
};

export type B2bStoreTransferOrder = {
  _id: string;
  ticketNumber?: string;
  status: string;
  quantity: number;
  unitPrice: number;
  currency?: string;
  vendorProductId?: { _id: string; vendorModel?: string; title?: string };
  skuId?: B2bStoreTransferSku;
  sourceWarehouseId?: { _id: string; name?: string };
  destWarehouseId?: { _id: string; name?: string };
  chatMessages?: B2bStoChatMessage[];
  deliveredAt?: string | null;
  receivedAt?: string | null;
  createdAt?: string;
};

export async function createStoreTransferRequest(payload: {
  vendorProductId: string;
  skuId: string;
  quantity: number;
  sourceWarehouseId: string;
  destWarehouseId: string;
}): Promise<B2bStoreTransferOrder> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/store-transfers`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Request failed');
  return json.data as B2bStoreTransferOrder;
}

export async function getMyStoreTransferOrders(): Promise<B2bStoreTransferOrder[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/store-transfers/mine`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to load orders');
  const data = json.data;
  return Array.isArray(data) ? data : [];
}

export async function getStoreTransferOrder(id: string): Promise<B2bStoreTransferOrder> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/store-transfers/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to load');
  return json.data as B2bStoreTransferOrder;
}

export async function getStoreTransferChatMessages(id: string): Promise<B2bStoChatMessage[]> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/store-transfers/${id}/chat-messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to load chat');
  return (json.data || []) as B2bStoChatMessage[];
}

export async function postStoreTransferChatMessage(
  id: string,
  text: string,
  replyToMessageId?: string,
): Promise<B2bStoChatMessage> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/store-transfers/${id}/chat-messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text, replyToMessageId }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Send failed');
  return json.data as B2bStoChatMessage;
}

export async function markStoreTransferReceived(id: string): Promise<B2bStoreTransferOrder> {
  const token = getToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/store-transfers/${id}/received`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to confirm');
  return json.data as B2bStoreTransferOrder;
}

export function storeTransferStatusLabel(status: string): string {
  const s = String(status || '').toUpperCase();
  const map: Record<string, string> = {
    SUBMITTED: 'Submitted',
    WIP: 'In progress',
    TRANSFER: 'Transfer',
    APPROVED: 'Approved',
    REJECTED: 'Rejected',
    DELIVERED: 'Delivered',
    RECEIVED: 'Received',
  };
  return map[s] || status;
}
