import { QueryOptionsType, Product } from '@framework/types';
import { useQuery } from '@tanstack/react-query';

// Fetch function

export const fetchProductsByNewArrival = async (
  // options: QueryOptionsType,
  categoryID: string,
) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  try {
    const response = await fetch(
      // `${BASE_API}/api/products/category/673dbe682e9f88fc46cd0a18/subcategory/`,
      `${BASE_API}api/products/category/${categoryID}/subcategory/`,
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
    // console.log(data.data, '===>>> Data.data');
    // console.log(
    //   data?.data.filter((product: any) => product.isNewArrival === true),
    //   '===>>> filtered Data',
    // );
    return data?.data.filter((product: any) => product.isNewArrival === false);
  } catch (error) {
    console.error('Error fetching category products:', error);
    throw error;
  }
};

// /api/products/category/673dbe682e9f88fc46cd0a18/subcategory/

// Query hook
export const useProductsByNewArrival = (categoryID: string) => {
  return useQuery<Product[], Error>({
    queryKey: ['products-by-new-arrival', categoryID],
    queryFn: () => fetchProductsByNewArrival(categoryID),
  });
};
