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

  // Common filter keys in this frontend: brand, category, subcategory, subsubcategory, text, search
  if (q?.brand) params.brand = q.brand;
  if (q?.category) params.category = q.category;
  if (q?.subcategory) params.subcategory = q.subcategory;
  if (q?.subsubcategory) params.subsubcategory = q.subsubcategory;

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

  // Sort: featured | new-arrivals | best-sellers | price-asc | price-desc
  if (q?.sort) params.sort = q.sort;

  // Quantity filter: min inventory (vendor total quantity)
  if (q?.minQuantity !== undefined && q?.minQuantity !== null && q?.minQuantity !== '') {
    const n = parseInt(String(q.minQuantity), 10);
    if (!isNaN(n) && n >= 0) params.minQuantity = n;
  }

  // Jewelry filters (SKU-level)
  if (q?.metalColor) params.metalColor = q.metalColor;
  if (q?.metalType) params.metalType = q.metalType;
  if (q?.size) params.size = q.size;
  if (q?.stonetype) params.stonetype = q.stonetype;
  if (q?.centerclarity) params.centerclarity = q.centerclarity;

  // Dynamic attribute filters (defaultSku.attributes keys from API)
  const knownKeys = new Set([
    'search', 'text', 'brand', 'category', 'subcategory', 'subsubcategory',
    'minPrice', 'maxPrice', 'sort', 'minQuantity', 'metalColor', 'metalType', 'size', 'stonetype', 'centerclarity',
  ]);
  Object.entries(q || {}).forEach(([key, val]) => {
    if (knownKeys.has(key)) return;
    if (val === undefined || val === null || val === '') return;
    params[key] = Array.isArray(val) ? val.join(',') : String(val);
  });

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
