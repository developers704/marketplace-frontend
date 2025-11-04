import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

export async function fetchAllWarehouses() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  
  try {
    const response = await fetch(`${BASE_API}/api/warehouses`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch warehouses');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching warehouses:', error);
    throw error;
  }
}

export const useWarehousesQuery = () => {
  return useQuery({
    queryKey: ['warehouses'],
    queryFn: () => fetchAllWarehouses(),
  });
};
