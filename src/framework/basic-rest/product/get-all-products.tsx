import { useInfiniteQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';
import { QueryOptionsType } from '@framework/types';
import type { VendorProductListItem, VendorProductsListResponse } from '../types/catalogV2';

type PaginatedVendorProducts = {
  data: VendorProductListItem[];
  paginatorInfo: VendorProductsListResponse['paginatorInfo'];
};

const mapQueryToParams = (options: any, pageParam: string | number | null) => {
  const params: Record<string, any> = {
    limit: options?.limit ?? 20,
  };

  // Use cursor if provided (cursor-based pagination), otherwise use page
  if (typeof pageParam === 'string' && pageParam) {
    params.cursor = pageParam; // Cursor is the last product ID
  } else {
    params.page = typeof pageParam === 'number' ? pageParam : 1;
  }

  // URL query params coming from the UI (filters)
  const q = options?.newQuery ?? {};

  // Common filter keys in this frontend: brand, category, text, search
  if (q?.brand) params.brand = q.brand;
  if (q?.category) params.category = q.category;

  // If the UI uses `text` or `search`, map it to v2 backend `search`
  if (q?.text) params.search = q.text;
  if (q?.search) params.search = q.search;

  // Price range filters
  if (q?.minPrice !== undefined && q?.minPrice !== null && q?.minPrice !== '') {
    params.minPrice = parseFloat(q.minPrice);
  }
  if (q?.maxPrice !== undefined && q?.maxPrice !== null && q?.maxPrice !== '') {
    params.maxPrice = parseFloat(q.maxPrice);
  }

  // Also allow direct options.text
  if (options?.text) params.search = options.text;
  if (options?.search) params.search = options.search;

  return params;
};

const fetchProducts = async ({ queryKey, pageParam }: any): Promise<PaginatedVendorProducts> => {
  const [, options] = queryKey as [string, QueryOptionsType & { newQuery?: any }];

  const params = mapQueryToParams(options, pageParam);
  const { data } = await http.get<VendorProductsListResponse>('/api/v2/products', { params });

  return {
    data: data?.data || [],
    paginatorInfo: data?.paginatorInfo,
  };
};

const useProductsQuery = (options: QueryOptionsType & { newQuery?: any }) => {
  return useInfiniteQuery<PaginatedVendorProducts, Error>({
    queryKey: ['v2-vendor-products', options],
    queryFn: fetchProducts,
    initialPageParam: null as string | null, // Start with null, will use cursor
    getNextPageParam: (lastPage) => {
      // Use cursor if available, otherwise fall back to nextPage
      if (lastPage?.paginatorInfo?.nextCursor) {
        return lastPage.paginatorInfo.nextCursor;
      }
      const next = lastPage?.paginatorInfo?.nextPage;
      return next ? next : undefined;
    },
  });
};

export { useProductsQuery, fetchProducts };
