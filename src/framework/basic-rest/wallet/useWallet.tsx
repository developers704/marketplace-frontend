import { getToken } from '../utils/get-token';

export async function getUserWallet() {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    if (!BASE_API) {
      throw new Error('API base URL is not configured');
    }

    const token = getToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(`${BASE_API}/api/checkout/wallet`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch user wallet' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your connection and ensure the backend is running.');
    }
    throw error;
  }
}

export async function getStoreWallet(warehouseId: any) {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    if (!BASE_API) {
      throw new Error('API base URL is not configured');
    }

    if (!warehouseId) {
      throw new Error('Warehouse ID is required');
    }

    const token = getToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(
      `${BASE_API}/api/warehouse-wallet/${warehouseId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch store wallet' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your connection and ensure the backend is running.');
    }
    throw error;
  }
}

// /process

export async function getWarehouseWallet(warehouseId: any) {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    if (!BASE_API) {
      throw new Error('API base URL is not configured');
    }

    if (!warehouseId) {
      throw new Error('Warehouse ID is required');
    }

    const token = getToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(
      `${BASE_API}/api/warehouses/${warehouseId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch warehouse wallet' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your connection and ensure the backend is running.');
    }
    throw error;
  }
}

// /process

export async function requestWalletCredit(
  amount: any,
  reason: any,
  targetWallet: any,
  selectedWarehouseId: any,
) {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    if (!BASE_API) {
      throw new Error('API base URL is not configured');
    }

    const token = getToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const value = {
      amount: amount,
      reason: reason,
      targetWallet: targetWallet,
      selectedWarehouseId: selectedWarehouseId,
    };

    const response = await fetch(`${BASE_API}/api/wallet-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(value),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to request wallet credit' }));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    // Re-throw with more context
    if (error instanceof TypeError && error.message === 'Failed to fetch') {
      throw new Error('Network error: Unable to connect to the server. Please check your connection and ensure the backend is running.');
    }
    throw error;
  }
}