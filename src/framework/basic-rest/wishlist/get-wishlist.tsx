import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

export async function getWishListItem() {
  try {
    const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
    if (!BASE_API) {
      throw new Error('API base URL is not configured');
    }

    const token = getToken();
    if (!token) {
      throw new Error('Authentication token is missing');
    }

    const response = await fetch(`${BASE_API}/api/wishlist/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Failed to fetch wishlist' }));
      return Promise.reject({ message: errorData.message || 'Failed to fetch wishlist', status: response.status });

      
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

export const useGetAllWishlist = () => {
  //   console.log(options, '===>>> id in query');
  return useQuery<any>({
    queryKey: ['Wishlist'],
    queryFn: () => getWishListItem(),
  });
};
