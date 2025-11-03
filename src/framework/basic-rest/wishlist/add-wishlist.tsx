import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

export async function addWishListItem( productId: any, productType: any) {
  //   console.log(options, '===>>> id in fetchAllSubCategories');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/wishlist/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      productType,
    }),
  });

  const data = await response.json();
  console.log(data, '===>>> Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    // throw new Error(errorMessage);
    return {message: errorMessage};
  }
  // console.log('response from login api is ', data);
  return data;
}
