'use client';

import { useContext, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Counter from '@components/ui/counter';
import Button from '@components/ui/button';
import cn from 'classnames';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { addToB2BCart } from '@/framework/basic-rest/catalogV2/b2b-cart';
import { createStoreTransferRequest } from '@/framework/basic-rest/b2bStoreTransfer/b2bStoreTransfer';

export default function B2BPurchasePanel({
  lang,
  vendorProductId,
  skuId,
  availableQty,
  hasMainWarehouse,
  warehouseId,
  className,
  cpPrice
}: {
  lang: string;
  vendorProductId: string;
  skuId: string | null;
  availableQty: number;
  hasMainWarehouse: boolean;
  warehouseId:string
  className?: string;
  cpPrice?: string
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { permissions } = useContext(PermissionsContext);
  const { data: userData } = useUserDataQuery();
  const canAddToCart = hasMainWarehouse === true;

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
  const canAddToCartPermission = permissions?.['Cart']?.View;
  const canRequestPermission = permissions?.['Request order']?.View;
  const showAddToCartButton = canAddToCart && canAddToCartPermission;
  const showRequestButton = !canAddToCart && canRequestPermission;



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
  // useEffect(() => {
  //   setQty(1);
  // }, [skuId]);
  
  useEffect(() => {
  if (qty > availableQty) {
    setQty(Math.max(1, availableQty));
  }
  }, [availableQty, warehouseId , skuId]);

  const canSubmit =
    isStoreManager &&
    !!vendorProductId &&
    !!skuId &&
    Number.isFinite(availableQty) &&
    availableQty > 0 &&
    qty > 0 &&
    qty <= availableQty &&
    (showAddToCartButton ? !!warehouseId : showRequestButton ? !!selectedWarehouseId : true);

  // Removed purchaseId and localStatus - no longer needed for cart-based flow

  // Add to cart mutation (replaces direct purchase)
  const storeTransferMutation = useMutation({
    mutationFn: async () => {
      if (!skuId) throw new Error('Select a SKU first');
      if (!selectedWarehouseId) {
        throw new Error('Select your store warehouse (use the warehouse selector in the header)');
      }
      if (!warehouseId) throw new Error('Source warehouse is missing for this product');
      return createStoreTransferRequest({
        vendorProductId,
        skuId,
        quantity: qty,
        sourceWarehouseId: warehouseId,
        destWarehouseId: selectedWarehouseId,
      });
    },
    onSuccess: (data) => {
      toast.success('Request sent to admin. You can track status and chat in the next screen.');
      router.push(`/${lang}/store-transfer/${data._id}`);
    },
    onError: (err: unknown) => {
      toast.error(err instanceof Error ? err.message : 'Request failed');
    },
  });

  const addToCartMutation = useMutation({
    mutationFn: async () => {
      if (!skuId) throw new Error('Select a SKU first');
      if (!warehouseId) throw new Error('Please select warehouse first');
      return await addToB2BCart({
        vendorProductId,
        skuId,
        quantity: qty,
        warehouseId
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
          <div className="text-sm font-semibold text-gray-900">Purchase</div>
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
            onDecrement={() => setQty((v: any) => Math.max(1, v - 1))}
            onIncrement={() => setQty((v : any) => Math.min(Math.max(1, availableQty || 1), v + 1))}
          />
          <div className="text-xs text-gray-500">Available: {availableQty || 0}</div>
        </div>

        {/* <div className="flex text-sm items-center gap-3 md:ml-auto">
      
          <Button
            // disabled={!canSubmit}
            disabled={!permissions?.['Request order']?.View}
            
            loading={addToCartMutation?.isPending}
            onClick={() => {
              if (!canAddToCart) {
                toast.info("Request sent to admin");
                return;
              }
              addToCartMutation.mutate();
            }}
          >
            {canAddToCart ? "Add to Cart" : "Request to Admin"}
          </Button>
        </div> */}

       <div className="flex flex-col text-sm items-center gap-3 md:ml-auto">

      {showAddToCartButton && (
        <>
        
        <Button
          disabled={!canSubmit}
          loading={addToCartMutation?.isPending}
          onClick={() => addToCartMutation.mutate()}
          className={cn(
              'relative flex-shrink min-w-0 text-center font-semibold text-white whitespace-nowrap',
              'text-[clamp(11px,0.85vw,14px)]',
              'transition-all duration-100 ease-out',
              'transform hover:-translate-y-0.5 hover:scale-[1.02]',
              'active:translate-y-0 active:scale-[0.97]',
              'px-[clamp(10px,1vw,18px)] py-[clamp(6px,0.7vw,10px)]',
              'rounded-tl-xl rounded-br-2xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700',
              'bg-black/90 ring-1 ring-black/10',
              'hover:bg-blue-900/95 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:ring-white/10',
              'active:bg-slate-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
            )}
        >
            Add to Cart 
        </Button>
        {/* <span>{cpPrice}</span> */}
        </>
      )}

      {showRequestButton && (
        <Button
        disabled={!canSubmit}
        loading={storeTransferMutation.isPending}
        onClick={() => storeTransferMutation.mutate()}
        className={cn(
          'relative flex-shrink min-w-0 text-center font-semibold text-white whitespace-nowrap',
          'text-[clamp(11px,0.85vw,14px)]',
          'transition-all duration-100 ease-out',
          'transform hover:-translate-y-0.5 hover:scale-[1.02]',
          'active:translate-y-0 active:scale-[0.97]',
          'px-[clamp(10px,1vw,18px)] py-[clamp(6px,0.7vw,10px)]',
              'rounded-tl-xl rounded-br-2xl',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-700',
              'bg-black/90 ring-1 ring-black/10',
              'hover:bg-blue-900/95 hover:shadow-[0_4px_16px_rgba(0,0,0,0.25)] hover:ring-white/10',
              'active:bg-slate-600 active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.25)]'
            )}
            >
            Request to Admin
            </Button>
          )}
          {showAddToCartButton || showRequestButton ? (
            <span className='text-md font-bold text-brand-dark' >{cpPrice}</span>
          ):"-"}
        </div>
          </div>

      {skuId && availableQty <= 0 ? (
        <div className="mt-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-md p-2">
          This SKU is currently out of stock. Choose a different metal/variant.
        </div>
      ) : null}

      {showRequestButton && !selectedWarehouseId ? (
        <div className="mt-3 text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-md p-2">
          Select your <strong>store warehouse</strong> from the site header before sending a request.
        </div>
      ) : null}

      <div className="mt-3 text-xs text-gray-500">
        After approval, stock is added to your store&apos;s catalog inventory (SkuInventory).{' '}
        <Link href={`/${lang}/marketplace/store-inventory`} className="text-brand-blue font-semibold underline">
          Open My Store Inventory
        </Link>
      </div>
    </div>
  );
}


