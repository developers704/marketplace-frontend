import { getToken } from '../utils/get-token';

export async function getUserWallet() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/checkout/wallet`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> cart response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

export async function getStoreWallet(warehouseId: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
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

  const data = await response.json();
  // console.log(data, '===>>> cart response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

// /process

export async function getWarehouseWallet(warehouseId: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
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

  const data = await response.json();
  // console.log(data, '===>>> cart response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}

// /process

export async function requestWalletCredit(
  amount: any,
  reason: any,
  targetWallet: any,
) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();

  const value = {
    amount: amount,
    reason: reason,
    targetWallet: targetWallet,
  };

  const response = await fetch(`${BASE_API}/api/wallet-request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(value),
  });

  const data = await response.json();
  console.log(data, '===>>> wallet request response Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return { message: errorMessage };
  }
  // console.log('response from login api is ', data);
  return data;
}