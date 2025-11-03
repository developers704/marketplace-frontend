import { QueryOptionsType, Product } from '@framework/types';
import { useQuery } from '@tanstack/react-query';
import http from '../utils/http';
import { API_ENDPOINTS } from '../utils/api-endpoints';

// Helper function for fetching from your own API
export const fetchBestSellerGroceryProducts = async ({ queryKey }: any) => {
  const { data } = await http.get(API_ENDPOINTS.BEST_SELLER_GROCERY_PRODUCTS);
  return data as Product[];
}; 
 
// React Query hook for fetching products
export const useBestSellerGroceryProductsQuery = (
  options: QueryOptionsType,
) => {
  return useQuery<Product[], Error>({
    queryKey: ['best-seller-grocery-products', options],
    queryFn: () => fetchBestSellerGroceryProducts(options),
  });
};
