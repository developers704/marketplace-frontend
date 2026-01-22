import { useQuery } from '@tanstack/react-query';
import http from '@framework/utils/http';

export type StoreInventoryRowV2 = {
  _id: string;
  quantity: number;
  storeWarehouseId?: { _id: string; name: string; isMain?: boolean };
  vendorProductId?: { _id: string; vendorModel: string; title: string; brand?: string; category?: string };
  skuId?: {
    _id: string;
    sku: string;
    price?: number;
    currency?: string;
    metalColor?: string;
    metalType?: string;
    size?: string;
    images?: string[];
  };
  updatedAt?: string;
  createdAt?: string;
};

export async function fetchMyStoreInventory(): Promise<StoreInventoryRowV2[]> {
  const { data } = await http.get<{ success: boolean; data: StoreInventoryRowV2[] }>(
    '/api/v2/b2b/store-inventory/my',
  );
  return data?.data || [];
}

export const useMyStoreInventoryQuery = () => {
  return useQuery<StoreInventoryRowV2[], Error>({
    queryKey: ['v2-my-store-inventory'],
    queryFn: fetchMyStoreInventory,
  });
};


