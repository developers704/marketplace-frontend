import { useQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';
import type { SkuDetailResponse } from '../types/catalogV2';

export async function fetchSku(skuId: string): Promise<SkuDetailResponse['data'] | null> {
  if (!skuId) return null;
  const { data } = await http.get<SkuDetailResponse>(`/api/v2/skus/${skuId}`);
  return data?.data ?? null;
}

export const useSkuQuery = (skuId?: string | null) => {
  return useQuery<SkuDetailResponse['data'] | null, Error>({
    queryKey: ['v2-sku', skuId],
    queryFn: () => fetchSku(String(skuId)),
    enabled: !!skuId,
  });
};


