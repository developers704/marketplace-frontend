import { QueryOptionsType, Product } from '@framework/types';
import http from '@framework/utils/http';
import { API_ENDPOINTS } from '@framework/utils/api-endpoints';
import { useQuery } from '@tanstack/react-query';

export const fetchBestSellerProducts = async ({ queryKey }: any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  try {
    const response = await fetch(`${BASE_API}/api/products/public`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get products');
    }

    const data = await response.json();
    // Filter only bestseller products
    const bestSellerProducts = data.filter(
      (product: Product) => product.isBestSeller === true
    );
    return bestSellerProducts as Product[];
  } catch (error: any) {
    console.error('Error fetching product data:', error);
    throw error;
  }
};
export const useBestSellerProductsQuery = (options: QueryOptionsType) => {
  return useQuery<Product[], Error>({
    queryKey: [API_ENDPOINTS.BEST_SELLER_PRODUCTS, options],
    queryFn: () => fetchBestSellerProducts(options),
  });
};
