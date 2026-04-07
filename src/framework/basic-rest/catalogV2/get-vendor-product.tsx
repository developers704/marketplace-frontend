import { useQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';
import type { VendorProductDetail } from '../types/catalogV2';

type VendorProductQueryOptions = {
  filterMain?: boolean;
  filterOwn?: boolean;
};

export async function fetchVendorProduct(
  productId: string,
  options: VendorProductQueryOptions = {}
): Promise<VendorProductDetail | null> {
  if (!productId) return null;
  const params: Record<string, string> = {};
  if (options.filterMain) {
    params.filterMain = 'true';
  }
  if (options.filterOwn) {
    params.filterOwn = 'true';
  }
  const { data } = await http.get<{ success: boolean; data: VendorProductDetail }>(
    `/api/v2/products/${productId}`,
    { params }
  );
  return data?.data ?? null;
}

export const useVendorProductQuery = (
  productId?: string | null,
  options: VendorProductQueryOptions = {}
) => {
  return useQuery<VendorProductDetail | null, Error>({
    queryKey: ['v2-vendor-product', productId, options.filterMain === true, options.filterOwn === true],
    queryFn: () => fetchVendorProduct(String(productId), options),
    enabled: !!productId,
  });
};


