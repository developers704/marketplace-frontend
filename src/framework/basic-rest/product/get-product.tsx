import { Product } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

// export const fetchProduct = async (_slug: string) => {
//   const { data } = await http.get(`${API_ENDPOINTS.PRODUCT}`);
//   return data;
// };

export async function fetchProduct(productId: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const response = await fetch(`${BASE_API}/api/products/${productId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> Data form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    console.log(errorMessage);
    // throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data[0];
}

export async function fetchNewProducts() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/products/new-products`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> new products form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    
    // Check if it's an authentication error
    if (data.message === 'Invalid token. Please log in again.' || response.status === 401) {
      // Import toast dynamically to avoid SSR issues
      const { toast } = await import('react-toastify');
      toast.error('Session expired. Please log in again.', {
        position: 'bottom-right',
        autoClose: 3000,
      });
      
      // Return null or empty data instead of throwing
      return null;
    }
    
    // For other errors, also show toast instead of throwing
    const { toast } = await import('react-toastify');
    toast.error(errorMessage, {
      position: 'bottom-right',
      autoClose: 3000,
    });
    
    return null;
  }
  // console.log('response from login api is ', data);
  return data;
}

export const useProductQuery = (productId: any) => {
  return useQuery<Product | any, Error>({
    queryKey: ['get-single-product', productId],
    queryFn: () => fetchProduct(productId),
  });
};

export const useNewlyProductQuery = () => {
  return useQuery<any, Error>({
    queryKey: ['get-new-product'],
    queryFn: () => fetchNewProducts(),
    retry: false, // Don't retry on authentication errors
    refetchOnWindowFocus: false, // Prevent unnecessary refetches
    onError: (error: any) => {
      // Error is already handled in fetchNewProducts with toast
      console.error('New products query error:', error);
    },
  });
};
