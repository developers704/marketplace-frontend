import http from '@framework/utils/http';
import { getToken } from '../utils/get-token';
import type { VendorProductListItem, VendorProductsListResponse } from '../types/catalogV2';

type SearchV2Params = {
  searchQuery: string;
  page?: number;
  limit?: number;
};

export type SearchV2ProductsPage = {
  items: VendorProductListItem[];
  hasNextPage: boolean;
  nextPage: number | null;
  total: number;
};

export async function searchGlobal() {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const token = getToken();
  const response = await fetch(`${BASE_API}/api/products/search-all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.message || 'Something went wrong. Please try again later.';
    return { message: errorMessage };
  }
  return data;
}

/** Search marketplace v2 products with pagination for global-search popup. */
export async function searchV2Products({
  searchQuery,
  page = 1,
  limit = 96,
}: SearchV2Params): Promise<SearchV2ProductsPage> {
  const q = (searchQuery || '').trim();
  if (!q) {
    return { items: [], hasNextPage: false, nextPage: null, total: 0 };
  }
  try {
    const { data } = await http.get<VendorProductsListResponse>('/api/v2/products', {
      params: { search: q, limit, page },
    });
    const items = data?.data ?? [];
    const pager = data?.paginatorInfo;
    return {
      items,
      hasNextPage: Boolean(pager?.hasNextPage),
      nextPage: pager?.nextPage ?? null,
      total: Number(pager?.total ?? items.length ?? 0),
    };
  } catch {
    return { items: [], hasNextPage: false, nextPage: null, total: 0 };
  }
}
