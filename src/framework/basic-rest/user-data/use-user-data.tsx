import { CategoriesQueryOptionsType, Category } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { useUI } from '@/contexts/ui.context';
import { CustomerProfile } from '@/components/my-account/account-details';
import axios from 'axios';

// const { isAuthorized } = useUI();
const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

// export const fetchProfileData = async () => {
//   const token = Cookies.get('auth_token');
//   if (!token) return;
//   const response = await fetch(`${BASE_API}/api/customers/profile`, {
//     method: 'GET',
//     headers: {
//       Authorization: `Bearer ${token}`,
//       'Content-Type': 'application/json',
//     },
//   });

//   const data = await response.json();
//   // console.log('Fetched profile data:', data);

//   if (!response.ok) {
//     const errorMessage = 'Something went wrong. Please try again later.';
//     throw new Error(errorMessage);
//   }

//   return data;
// };

export const fetchProfileData = async () => {
  const token = Cookies.get('auth_token');
  if (!token) return;

  try {
    const response = await axios.get(`${BASE_API}/api/customers/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error: any) {
    const errorMessage =
      error.response?.data?.message ||
      'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
};

export const useUserDataQuery = () => {
  // console.log(options, "===>>> otions")
  return useQuery({
    queryKey: ['User'],
    queryFn: fetchProfileData,
  });
};
