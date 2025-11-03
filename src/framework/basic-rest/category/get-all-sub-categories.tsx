import { CategoriesQueryOptionsType, Category } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';

export async function fetchAllSubCategories(options: any) {
  //   console.log(options, '===>>> id in fetchAllSubCategories');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const response = await fetch(
    // ` ${BASE_API}/api/products/category/${options}/subcategory/`
    `${BASE_API}/api/categories/subcategory`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();
  //   console.log(data, '===>>> Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
}

export const fetchSubCategories = async (categoryId: string | any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const response = await fetch(
    // ` ${BASE_API}/api/products/category/${options}/subcategory/`
    `${BASE_API}/api/categories/subcategories/${categoryId}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    },
  );

  const data = await response.json();
    // console.log(data, '===>>> sub cate by cate id Data');

  if (!response.ok) {
    const errorMessage =
      data.message || 'Something went wrong. Please try again later.';
    throw new Error(errorMessage);
  }
  // console.log('response from login api is ', data);
  return data;
};

// http://localhost:5000/api/products/category/673dbe682e9f88fc46cd0a18/subcategory/

// /api/categories/subcategories/673dbe682e9f88fc46cd0a18  ====>>>> get subcategories by category id
// /api/products/category/673dbe682e9f88fc46cd0a18   ====>>>>> get products by category id

export const useSubCategoriesQuery = (options?: any) => {
  //   console.log(options, '===>>> id in query');
  return useQuery<Category[], Error>({
    queryKey: ['Categories', options],
    queryFn: () => fetchAllSubCategories(options),
  });
};
