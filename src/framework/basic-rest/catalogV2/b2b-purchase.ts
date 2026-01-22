import http from '@framework/utils/http';

export type B2BPurchaseCreatePayload = {
  // Cart-based purchase (recommended)
  cartId?: string;
  // Single-item purchase (backward compatible)
  vendorProductId?: string;
  skuId?: string;
  quantity?: number;
  storeWarehouseId?: string;
};

export type B2BPurchaseCreateResponse = {
  success?: boolean;
  message?: string;
  data?: any;
  purchaseId?: string;
  status?: string;
  _id?: string;
};

export type B2BPurchaseStatusResponse = {
  success?: boolean;
  message?: string;
  data?: any;
  status?: string;
};

export async function createB2BPurchase(payload: B2BPurchaseCreatePayload) {
  try {
    const { data } = await http.post<B2BPurchaseCreateResponse>(
      '/api/v2/b2b/purchase',
      payload
    );
    return data;
  } catch (err: any) {
    const message =
      err?.response?.data?.message ||
      'Unable to create purchase request';

     return Promise.reject({
      message,
      response: err?.response,
    });
  }
}


export async function getB2BPurchaseStatus(purchaseId: string) {
  const { data } = await http.get<B2BPurchaseStatusResponse>(`/api/v2/b2b/status/${purchaseId}`);
  return data;
}


