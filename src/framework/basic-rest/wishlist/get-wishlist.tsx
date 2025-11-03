import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

export async function getWishListItem() {
  //   console.log(options, '===>>> id in fetchAllSubCategories');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/wishlist/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    // console.log(errorMessage, '===>>> errorMessage');
    return {message: errorMessage};
  }
  // console.log('response from login api is ', data);
    
  return data;
}

export const useGetAllWishlist = () => {
  //   console.log(options, '===>>> id in query');
  return useQuery<any>({
    queryKey: ['Wishlist'],
    queryFn: () => getWishListItem(),
  });
};
