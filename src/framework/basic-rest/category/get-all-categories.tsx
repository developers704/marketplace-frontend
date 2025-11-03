import { CategoriesQueryOptionsType, Category } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';

// export const fetchCategories = async ({ queryKey }: any) => {
//   // const options = queryKey[1];
//   const { data } = await http.get(API_ENDPOINTS.CATEGORIES);
//   // console.log(data);

//   return {
//     categories: {
//       data: data.data as Category[],
//     },
//   };
// };

export async function fetchAllCategories() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const response = await fetch(`${BASE_API}/api/categories/category`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();
  // console.log(data, "===>>> Data")

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export const useCategoriesQuery = (options?: CategoriesQueryOptionsType) => {
  // console.log(options, "===>>> otions")
  return useQuery<any, Error>({
    queryKey: ['Categories', options],
    // queryFn: fetchCategories,
    queryFn: fetchAllCategories,
  });
};
