import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';

const fetchAddress = async () => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = Cookies.get('auth_token');
  try {
    const response = await fetch(`${BASE_API}/api/addresses`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch address');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.log(error);
  }
};

const useAddressQuery = () => {
  return useQuery({
    queryKey: ['addresses'],
    queryFn: () => fetchAddress(),
  });
};

export { useAddressQuery, fetchAddress };
