import { Product } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

// export const fetchProduct = async (_slug: string) => {
//   const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}`);
//   return data;
// };

export async function fetchSpeacialProduct(productId: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(
    `${BASE_API}/api/special-products/${productId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
  );

  const data = await response.json();
  console.log(data, '===>>> Data form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export async function fetchAllSpeacialProduct(type: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const response = await fetch(
    `${BASE_API}/api/special-products/type/${type}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();
  console.log(data, '===>>> special products');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export const useAllSpecialProductQuery = (type: any) => {
  return useQuery<Product | any, Error>({
    queryKey: ['get-all-special-product', type],
    queryFn: () => fetchAllSpeacialProduct(type),
  });
};

export const useSpecialProductQuery = (id: any) => {
  return useQuery<Product | any, Error>({
    queryKey: ['get-special-product', id],
    queryFn: () => fetchSpeacialProduct(id),
  });
};
