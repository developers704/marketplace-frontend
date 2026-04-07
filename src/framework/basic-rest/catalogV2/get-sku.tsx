import { useQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';
import type { SkuDetailResponse } from '../types/catalogV2';

type SkuQueryOptions = {
  filterMain?: boolean;
  filterOwn?: boolean;
};

export async function fetchSku(
  skuId: string,
  options: SkuQueryOptions = {}
): Promise<SkuDetailResponse['data'] | null> {
  if (!skuId) return null;
  const params: Record<string, string> = {};
  if (options.filterMain) {
    params.filterMain = 'true';
  }
  if (options.filterOwn) {
    params.filterOwn = 'true';
  }
  const { data } = await http.get<SkuDetailResponse>(`/api/v2/skus/${skuId}`, { params });
  return data?.data ?? null;
}

export const useSkuQuery = (skuId?: string | null, options: SkuQueryOptions = {}) => {
  return useQuery<SkuDetailResponse['data'] | null, Error>({
    queryKey: ['v2-sku', skuId, options.filterMain === true, options.filterOwn === true],
    queryFn: () => fetchSku(String(skuId), options),
    enabled: !!skuId,
  });
};


