import { Product } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';
import type { VendorProductListItem, VendorProductsListResponse } from '../types/catalogV2';

// export const fetchProduct = async (_slug: string) => {
//   const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}`);
//   return data;
// };

export async function searchGlobal() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/products/search-all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> Search form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
      return {message: errorMessage};
    // throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

/** Search marketplace v2 products (same collection as marketplace page). Returns list for global search dropdown. */
export async function searchV2Products(searchQuery: string): Promise<VendorProductListItem[]> {
  const q = (searchQuery || '').trim();
  if (!q) return [];
  try {
    const { data } = await http.get<VendorProductsListResponse>('/api/v2/products', {
      params: { search: q, limit: 10, page: 1 },
    });
    return data?.data ?? [];
  } catch {
    return [];
  }
}

// export async function readNotifications(id: any) {
//   const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
//   const token = getToken();
//   const response = await fetch(`${BASE_API}/api/notifications/${id}/read`, {
//     method: 'PUT',
//     headers: {
//       'Content-Type': 'application/json',
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   const data = await response.json();
//   console.log(data, '===>>> notifications read form query');

//   if (!response.ok) {
//     const errorMessage =
//       data.message || 'Something went wrong. Please try again later.';
//     throw new Error(errorMessage);
//   }
//   // console.log('response from login api is ', data);
//   return data;
// }

// export const useNotificationQuery = () => {
//   return useQuery<any>({
//     queryKey: ['get-notifications'],
//     queryFn: () => fetchNotifications(),
//   });
// };
