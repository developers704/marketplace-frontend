const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

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
  };
  quantity: number;
  storeWarehouseId: {
    _id: string;
    name: string;
    isMain?: boolean;
  };
  status: 'PENDING_DM' | 'PENDING_CM' | 'PENDING_ADMIN' | 'APPROVED' | 'REJECTED';
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
