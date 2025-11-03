import { QueryOptionsType, Product } from '@framework/types';
import { useQuery } from '@tanstack/react-query';
import { getToken } from '../utils/get-token';

// Fetch function
export const fetchProductsByCategory = async (
  // options?: QueryOptionsType,
  // categoryName?: string,
  categoryId?: any,
  subCategoryId?: any,
) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  // console.log(categoryId, '===>>> category id from fetchProductsByCategory');
  try {
    const response = await fetch(
      `${BASE_API}/api/products/category/${categoryId}/subcategory/${subCategoryId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    // console.log(data, '===>>> category data');
    return data;
  } catch (error) {
    console.error('Error fetching category products:', error);
    throw error;
  }
};

// Fetch function
export const fetchProducts = async () => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  // console.log(categoryId, '===>>> category id from fetchProductsByCategory');
  try {
    const response = await fetch(`${BASE_API}/api/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    // console.log(data, '===>>> category data');
    return data;
  } catch (error) {
    console.error('Error fetching category products:', error);
    throw error;
  }
};

// export const fetchSpecialProductsByCategory = async (categoryID: string) => {
//   const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

//   try {
//     const response = await fetch(
//       `${BASE_API}/api/special-products/category/${categoryID}`,
//       {
//         method: 'GET',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//       },
//     );

//     if (!response.ok) {
//       throw new Error('Failed to fetch products');
//     }

//     const data = await response.json();
//     console.log(data, '===>>> special category data');
//     return data;
//   } catch (error) {
//     console.error('Error fetching category products:', error);
//     throw error;
//   }
// };

// /api/products/category/673dbe682e9f88fc46cd0a18/subcategory/

// Query hook

export const useProductsByCategoryQuery = (
  // options: QueryOptionsType,
  // categoryName: string,
  categoryId?: any,
  subCategoryId?: any,
) => {
  return useQuery({
    queryKey: ['products-by-category', categoryId, subCategoryId],
    queryFn: () => fetchProductsByCategory(categoryId, subCategoryId),
  });
};

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: () => fetchProducts(),
  });
};

// export async function fetchAllSubCategories(options: any) {
//   //   console.log(options, '===>>> id in fetchAllSubCategories');
//   const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
//   const response = await fetch(
//     // ` ${BASE_API}/api/products/category/${options}/subcategory/`
//     `${BASE_API}/api/categories/subcategory`,
//     {
//       method: 'GET',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     },
//   );

//   const data = await response.json();
//   //   console.log(data, '===>>> Data');

//   if (!response.ok) {
//     const errorMessage =
//       data.message || 'Something went wrong. Please try again later.';
//     throw new Error(errorMessage);
//   }
//   // console.log('response from login api is ', data);
//   return data;
// }

// http://localhost:5000/api/products/category/673dbe682e9f88fc46cd0a18/subcategory/

// export const useSubCategoriesQuery = (options?: any) => {
//   //   console.log(options, '===>>> id in query');
//   return useQuery<Category[], Error>({
//     queryKey: ['Categories', options],
//     queryFn: () => fetchAllSubCategories(options),
//   });
// };
