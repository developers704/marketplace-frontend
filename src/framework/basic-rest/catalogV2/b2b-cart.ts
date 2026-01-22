const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

export type B2BCartItem = {
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
  price: number;
  currency: string;
};

export type B2BCart = {
  _id: string;
  customer: string;
  storeWarehouseId: {
    _id: string;
    name: string;
    isMain?: boolean;
  };
  items: B2BCartItem[];
  subtotal: number;
  walletBalance?: number;
  remainingBalance?: number;
  createdAt: string;
  updatedAt: string;
};

export async function getB2BCart(): Promise<B2BCart> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/cart`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to fetch cart' }));
    throw new Error(error.message || 'Failed to fetch cart');
  }

  const data = await res.json();
  return data.data;
}

export async function addToB2BCart(payload: {
  vendorProductId: string;
  skuId: string;
  quantity: number;
}): Promise<B2BCart> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/cart/add`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to add to cart' }));
    throw new Error(error.message || 'Failed to add to cart');
  }

  const data = await res.json();
  return data.data;
}

export async function updateB2BCartItem(itemId: string, quantity: number): Promise<B2BCart> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/cart/update/${itemId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to update cart item' }));
    throw new Error(error.message || 'Failed to update cart item');
  }

  const data = await res.json();
  return data.data;
}

export async function removeFromB2BCart(itemId: string): Promise<B2BCart> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/cart/remove/${itemId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to remove from cart' }));
    throw new Error(error.message || 'Failed to remove from cart');
  }

  const data = await res.json();
  return data.data;
}

export async function clearB2BCart(): Promise<void> {
  const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
  if (!token) throw new Error('Not authenticated');

  const res = await fetch(`${BASE_API}/api/v2/b2b/cart/clear`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: 'Failed to clear cart' }));
    throw new Error(error.message || 'Failed to clear cart');
  }
}

