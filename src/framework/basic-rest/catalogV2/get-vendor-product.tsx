import { useQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';
import type { VendorProductDetail } from '../types/catalogV2';

export async function fetchVendorProduct(productId: string): Promise<VendorProductDetail | null> {
  if (!productId) return null;
  const { data } = await http.get<{ success: boolean; data: VendorProductDetail }>(`/api/v2/products/${productId}`);
  return data?.data ?? null;
}

export const useVendorProductQuery = (productId?: string | null) => {
  return useQuery<VendorProductDetail | null, Error>({
    queryKey: ['v2-vendor-product', productId],
    queryFn: () => fetchVendorProduct(String(productId)),
    enabled: !!productId,
  });
};


