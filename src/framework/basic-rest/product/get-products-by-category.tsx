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
export const fetchProducts = async (warehouseFilter?: string, warehouseId?: string, page: number = 1, limit: number = 20) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  try {
    const params = new URLSearchParams();
    if (warehouseFilter) {
      params.append('warehouseFilter', warehouseFilter);
    }
    if (warehouseId) {
      params.append('warehouseId', warehouseId);
    }
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const queryString = params.toString();
    const url = `${BASE_API}/api/products${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
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
    // Handle both old format (array) and new format (object with products and pagination)
    if (Array.isArray(data)) {
      return { products: data, pagination: { page: 1, limit: data.length, total: data.length, totalPages: 1 } };
    }
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

export const useProducts = (warehouseFilter?: string, warehouseId?: string, page: number = 1, limit: number = 20) => {
  return useQuery({
    queryKey: ['products', warehouseFilter, warehouseId, page, limit],
    queryFn: () => fetchProducts(warehouseFilter, warehouseId, page, limit),
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
