import { Product } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

// export const fetchProduct = async (_slug: string) => {
//   const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}`);
//   return data;
// };

export async function fetchVariantsName() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/variants/variant-names`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
//   console.log(data, '===>>> fetchVariantsName form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export async function fetchProductsVariants() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/variants/product-variants`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
//   console.log(data, '===>>> fetchProductsVariants read form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export const useVariantsName = () => {
  return useQuery<any>({
    queryKey: ['get-variants-name'],
    queryFn: () => fetchVariantsName(),
  });
};
