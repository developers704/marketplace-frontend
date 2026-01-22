'use client';

import Container from '@components/ui/container';
import Alert from '@components/ui/alert';
import Image from '@components/ui/image';
import { productPlaceholder } from '@assets/placeholders';
import { useMyStoreInventoryQuery } from '@framework/catalogV2/get-store-inventory';
import InventoryStatusBadge from '@components/marketplace/inventory-status-badge';
import { RefreshCcw } from 'lucide-react';

const buildImageUrl = (baseApi: string | undefined, src: string | undefined) => {
  if (!src) return productPlaceholder;
  const s = String(src).trim();
  if (!s) return productPlaceholder;
  if (s.startsWith('http://') || s.startsWith('https://')) return s;
  if (!baseApi) return s.startsWith('/') ? s : `/${s}`;
  if (s.startsWith('/')) return `${baseApi}${s}`;
  return `${baseApi}/${s}`;
};

export default function StoreInventoryPageContent({ lang }: { lang: string }) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const { data, isLoading, error, refetch } = useMyStoreInventoryQuery();

  const rows = data || [];
  const totalQty = rows.reduce((sum, r) => sum + Number(r?.quantity || 0), 0);
  const storeName = rows?.[0]?.storeWarehouseId?.name || '';

  return (
    <Container>
      <div className="py-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Store Inventory</h1>
            <div className="text-sm text-gray-600 mt-1">
              {storeName ? <span>Store: {storeName}</span> : 'Inventory added from approved Marketplace purchases.'}
            </div>
          </div>
          <div className="text-right">
            <InventoryStatusBadge quantity={totalQty} />
            <div className="text-xs text-gray-500 mt-2">Total Qty: {totalQty}</div>
            <button
              className="mt-2 text-xs text-brand-blue font-semibold underline translate-x-0 hover:-translate-x-2 transition-transform inline-flex items-center gap-1"
              onClick={() => refetch()}
              type="button"
            >
             <RefreshCcw />
            </button>
          </div>
        </div>

        {error ? <Alert message={error.message} /> : null}

        {isLoading ? (
          <div className="h-32 bg-gray-50 rounded-xl animate-pulse" />
        ) : rows.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-xl p-6 text-gray-700">
            No store inventory yet. Once your purchase request is approved by Admin, items will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {rows.map((r) => {
              const vendorModel = r?.vendorProductId?.vendorModel || '—';
              const title = r?.vendorProductId?.title || vendorModel;
              const brand = r?.vendorProductId?.brand || '';
              const sku = r?.skuId?.sku || '—';
              const img = r?.skuId?.images?.[0];
              const imageUrl = buildImageUrl(BASE_API, img);
              const qty = Number(r?.quantity || 0);
              const variant = [r?.skuId?.metalType, r?.skuId?.metalColor, r?.skuId?.size]
                .filter(Boolean)
                .join(' / ');

              return (
                <div key={r._id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm cursor-pointer hover:shadow-md transition-shadow ">
                  <div className="relative">
                    <div className="relative w-full aspect-square bg-gray-50">
                      <Image src={imageUrl} alt={title} fill className="object-cover" />
                    </div>
                    <div className="absolute top-3 left-3">
                      <InventoryStatusBadge quantity={qty} />
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white/95 text-gray-700 border shadow-sm">
                        Qty: {qty}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-sm font-bold text-gray-900 line-clamp-2">{title}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold">Model:</span> {vendorModel}
                    </div>
                    {brand ? <div className="text-xs text-gray-500 mt-1">Brand: {brand}</div> : null}
                    <div className="text-xs text-gray-500 mt-2">
                      <span className="font-semibold">SKU:</span> {sku}
                    </div>
                    {variant ? <div className="text-xs text-gray-500 mt-1">{variant}</div> : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}


