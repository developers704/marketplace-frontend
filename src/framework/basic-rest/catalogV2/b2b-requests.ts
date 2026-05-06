const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

export type B2BPurchaseFulfillmentStatus = 'NONE' | 'SUBMITTED' | 'IN_PROCESS' | 'SHIPPED' | 'COMPLETED';

export type B2BPurchaseChatMessage = {
  _id: string;
  text: string;
  role: 'user' | 'admin';
  senderId?: string;
  senderName?: string;
  replyToMessageId?: string | null;
  replyToText?: string;
  replyToSenderName?: string;
  attachments?: Array<{
    name?: string;
    url: string;
    mimeType?: string;
    size?: number;
  }>;
  voice?: {
    name?: string;
    url: string;
    mimeType?: string;
    size?: number;
    durationMs?: number;
  } | null;
  seenBy?: Array<{
    userId: string;
    userModel: 'Customer' | 'User';
    seenAt: string;
  }>;
  createdAt?: string;
};

export type B2BPurchaseRequest = {
  _id: string;
  vendorProductId: {
    _id: string;
    vendorModel: string;
    title: string;
    brand?: string;
    category?: string;
  };
  skuId: {
    _id: string;
    sku: string;
    price: number;
    currency: string;
    metalColor?: string;
    metalType?: string;
    size?: string;
    images?: string[];
    attributes?: Record<string, string | number | undefined | null>;
  };
  quantity: number;
  storeWarehouseId: {
    _id: string;
    name: string;
    isMain?: boolean;
  };
  status: 'PENDING_DM' | 'PENDING_CM' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED';
  fulfillmentStatus?: B2BPurchaseFulfillmentStatus;
  shippedAt?: string | null;
  completedAt?: string | null;
  cartItemPrice?: number;
  cartItemCurrency?: string;
  requestedBy: string;
  requestedByModel: 'Customer' | 'User';
  requestedByUser?: {
    username: string;
    email: string;
    phone_number?: string;
  };
  approvals?: {
    dm?: { userId: string; approvedAt: string };
    cm?: { userId: string; approvedAt: string };
    admin?: { userId: string; approvedAt: string };
  };
  rejection?: {
    rejectedBy: string;
    rejectedAt: string;
    reason: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type B2BRequestsResponse = {
  success: boolean;
  message: string;
  data: B2BPurchaseRequest[];
};

export async function getB2BRequests(params?: { status?: string }): Promise<B2BPurchaseRequest[]> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const url = new URL(`${BASE_API}/api/v2/b2b/requests?view=my-orders`);
  if (params?.status) {
    url.searchParams.set('status', params.status);
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch B2B requests' }));
    throw new Error(error.message || 'Failed to fetch B2B requests');
  }

  const result: B2BRequestsResponse = await res.json();
  return result.data || [];
}

function getAuthToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

/** Single purchase detail (same payload as list item + chat fields when populated). */
export async function getB2BPurchaseDetail(purchaseId: string): Promise<B2BPurchaseRequest> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/status/${purchaseId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to load purchase');
  return json.data as B2BPurchaseRequest;
}

export async function getB2BPurchaseChatMessages(purchaseId: string): Promise<B2BPurchaseChatMessage[]> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/requests/${purchaseId}/chat-messages`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to load messages');
  return Array.isArray(json.data) ? json.data : [];
}

export async function postB2BPurchaseChatMessage(
  purchaseId: string,
  text: string,
  replyToMessageId?: string | null,
  attachments?: B2BPurchaseChatMessage['attachments'],
  voice?: B2BPurchaseChatMessage['voice'],
): Promise<B2BPurchaseChatMessage> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/requests/${purchaseId}/chat-messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text,
      replyToMessageId: replyToMessageId || null,
      attachments: attachments || [],
      voice: voice || null,
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Send failed');
  return json.data as B2BPurchaseChatMessage;
}

export async function markB2BPurchaseChatSeen(purchaseId: string): Promise<boolean> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/requests/${purchaseId}/chat-messages/seen`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Failed to mark seen');
  return !!json?.data?.updated;
}

export async function patchB2BPurchaseFulfillment(
  purchaseId: string,
  fulfillmentStatus: B2BPurchaseFulfillmentStatus,
): Promise<B2BPurchaseRequest> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/requests/${purchaseId}/fulfillment`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fulfillmentStatus }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Update failed');
  return json.data as B2BPurchaseRequest;
}

export async function markB2BPurchaseReceived(purchaseId: string): Promise<B2BPurchaseRequest> {
  const token = getAuthToken();
  if (!token) throw new Error('Not authenticated');
  const res = await fetch(`${BASE_API}/api/v2/b2b/requests/${purchaseId}/mark-received`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.message || 'Could not confirm receipt');
  return json.data as B2BPurchaseRequest;
}

export function fulfillmentLabel(status?: B2BPurchaseFulfillmentStatus | string): string {
  switch (status) {
    case 'SUBMITTED':
      return 'Submitted';
    case 'IN_PROCESS':
      return 'In process';
    case 'SHIPPED':
      return 'Shipped';
    case 'COMPLETED':
      return 'Completed';
    case 'NONE':
    default:
      return '—';
  }
}
