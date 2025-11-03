import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

export async function fetchNotifications() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/notifications/`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> notifications form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export async function readNotifications(id: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/notifications/${id}/read`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();
  // console.log(data, '===>>> notifications read form query');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export const useNotificationQuery = () => {
  return useQuery<any>({
    queryKey: ['get-notifications'],
    queryFn: () => fetchNotifications(),
  });
};
