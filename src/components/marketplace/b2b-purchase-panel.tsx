'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Counter from '@components/ui/counter';
import Button from '@components/ui/button';
import cn from 'classnames';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { addToB2BCart } from '@/framework/basic-rest/catalogV2/b2b-cart';

export default function B2BPurchasePanel({
  lang,
  vendorProductId,
  skuId,
  availableQty,
  className,
}: {
  lang: string;
  vendorProductId: string;
  skuId: string | null;
  availableQty: number;
  className?: string;
}) {
  const queryClient = useQueryClient();
  const { permissions } = useContext(PermissionsContext);
  const { data: userData } = useUserDataQuery();

  const roleName = String(userData?.role?.role_name || '').toLowerCase().trim();

  // Heuristic: treat "store manager" (and similar store roles) as B2B buyers.
  // Also allow if Inventory Order module is visible (common for store roles).
  const isStoreManager = useMemo(() => {
    if (roleName.includes('store')) return true;
    if (roleName === 'salesman') return true;
    if (permissions?.['Inventory Order']?.View) return true;
    return false;
  }, [roleName, permissions]);

  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | undefined>(undefined);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('selectedWarehouse');
      if (!saved) return;
      const parsed = JSON.parse(saved);
      if (parsed?._id) setSelectedWarehouseId(String(parsed._id));
    } catch {
      // ignore
    }
  }, []);

  const [qty, setQty] = useState(1);
  useEffect(() => {
    setQty(1);
  }, [skuId]);

  const canSubmit =
    isStoreManager &&
    !!vendorProductId &&
    !!skuId &&
    Number.isFinite(availableQty) &&
    availableQty > 0 &&
    qty > 0 &&
    qty <= availableQty;

  // Removed purchaseId and localStatus - no longer needed for cart-based flow

  // Add to cart mutation (replaces direct purchase)
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!skuId) throw new Error('Select a SKU first');
      return await addToB2BCart({
        vendorProductId,
        skuId,
        quantity: qty,
      });
    },
    onSuccess: () => {
      toast.success('Item added to cart');
      queryClient.invalidateQueries({ queryKey: ['v2-b2b-cart'] });
    },
    onError: (err: any) => {
      const message = err?.message || 'Failed to add to cart';
      if (message.includes('warehouse')) {
        toast.error('Please select a warehouse first');
      } else {
        toast.error(message);
      }
    },
  });

  // Removed status polling - handled in cart drawer after placing order

  if (!isStoreManager) return null;

  const outOfStock = !skuId || availableQty <= 0;

  return (
    <div className={cn('bg-white rounded-xl border border-gray-200 p-5', className)}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-sm font-semibold text-gray-900">B2B Store Purchase</div>
          <div className="text-xs text-gray-500">Request admin approval before adding to your store inventory.</div>
        </div>
        {/* Status badge removed - cart-based flow doesn't show status here */}
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-sm font-semibold text-gray-700">Qty</div>
          <Counter
            lang={lang}
            value={qty}
            variant="mercury"
            disabled={outOfStock || qty >= availableQty}
            onDecrement={() => setQty((v) => Math.max(1, v - 1))}
            onIncrement={() => setQty((v) => Math.min(Math.max(1, availableQty || 1), v + 1))}
          />
          <div className="text-xs text-gray-500">Available: {availableQty || 0}</div>
        </div>

        <div className="flex text-sm items-center gap-3 md:ml-auto ">
          <Button
            disabled={!canSubmit || addToCartMutation?.isPending}
            loading={addToCartMutation?.isPending}
            className='text-sm'
            onClick={() => {
              if (!skuId) return toast.error('Select a SKU first');
              if (availableQty <= 0) return toast.error('Selected SKU is out of stock');
              if (qty > availableQty) return toast.error('Requested quantity exceeds available stock');
              addToCartMutation.mutate();
            }}
          >
            Add to Cart
          </Button>
        </div>
      </div>

      {skuId && availableQty <= 0 ? (
        <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
          This SKU is currently out of stock. Choose a different metal/variant.
        </div>
      ) : null}

      <div className="mt-3 text-xs text-gray-500">
        After approval, the stock will appear in your store inventory.{' '}
        <Link href={`/${lang}/marketplace/store-inventory`} className="text-brand-blue font-semibold underline">
          Open My Store Inventory
        </Link>
      </div>
    </div>
  );
}


