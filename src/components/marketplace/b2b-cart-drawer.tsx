'use client';

import { useState,  useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { X, ShoppingCart, Trash2, Plus, Minus, DollarSign } from 'lucide-react';
import Button from '@components/ui/button';
import Counter from '@components/ui/counter';
import { getB2BCart, updateB2BCartItem, removeFromB2BCart, clearB2BCart, type B2BCart } from '@/framework/basic-rest/catalogV2/b2b-cart';
import { createB2BPurchase } from '@/framework/basic-rest/catalogV2/b2b-purchase';
import usePrice, { formatPrice, formatVariantPrice } from '@framework/product/use-price';
import cn from 'classnames';



 export function getPrice(
  data?: {
    amount: number;
    baseAmount?: number;
    currencyCode: string;
  } | null,
) {
  const { amount, baseAmount, currencyCode } = data ?? {};
  const locale = 'en';

  if (typeof amount !== 'number' || !currencyCode) {
    return { price: '', basePrice: null, discount: null };
  }

  const value = baseAmount
    ? formatVariantPrice({ amount, baseAmount, currencyCode, locale })
    : formatPrice({ amount, currencyCode, locale });

  return typeof value === 'string'
    ? { price: value, basePrice: null, discount: null }
    : value;
}

export default function B2BCartDrawer({
  isOpen,
  onClose,
  lang,
}: {
  isOpen: boolean;
  onClose: () => void;
  lang: string;
}) {
  const queryClient = useQueryClient();
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const { data: cart, isLoading, refetch } = useQuery({
    queryKey: ['v2-b2b-cart'],
    queryFn: getB2BCart,
    enabled: isOpen,
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ itemId, quantity }: { itemId: string; quantity: number }) =>
      updateB2BCartItem(itemId, quantity),
    onSuccess: () => {
      // refetch();
      queryClient.invalidateQueries({ queryKey: ['v2-b2b-cart'] });
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to update cart item');
    },
  });

// debounce timer per cart item
const debounceTimersRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  

  const removeItemMutation = useMutation({
    mutationFn: (itemId: string) => removeFromB2BCart(itemId),
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['v2-b2b-cart'] });
      toast.success('Item removed from cart');
    },
    onError: (err: any) => {
      toast.error(err?.message || 'Failed to remove item');
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: async () => {
      if (!cart?._id) throw new Error('Cart not found');
      return await createB2BPurchase({ cartId: cart._id });
    },
    onSuccess: (res: any) => {
      toast.success(res?.message || 'Purchase requests created successfully');
      queryClient.invalidateQueries({ queryKey: ['v2-b2b-cart'] });
      queryClient.invalidateQueries({ queryKey: ['v2-b2b-purchase-status'] });
      onClose();
    },
      onError: (err: any) => {
      const backendMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        'Failed to place purchase request';

      if (backendMessage.toLowerCase().includes('wallet')) {
        toast.error('Insufficient wallet balance. Please top up your wallet.');
      } else if (
        backendMessage.toLowerCase().includes('stock') ||
        backendMessage.toLowerCase().includes('warehouse') ||
        backendMessage.toLowerCase().includes('quantity')
      ) {
        toast.error(backendMessage);
      } else {
        toast.error(backendMessage);
      }

    },
  });

  const handlePlaceOrder = async () => {
    if (!cart || cart.items.length === 0) {
      toast.error('Cart is empty');
      return;
    }

    const walletBalance = cart.walletBalance || 0;
    const subtotal = cart.subtotal || 0;

    if (walletBalance < subtotal) {
      toast.error(`Insufficient wallet balance. Available: ${walletBalance.toFixed(2)}, Required: ${subtotal.toFixed(2)}`);
      return;
    }

    setIsPlacingOrder(true);
    try {
      await placeOrderMutation.mutateAsync();
    } finally {
      setIsPlacingOrder(false);
    }
  };

  

  const walletBalance = cart?.walletBalance || 0;
  const subtotal = cart?.subtotal || 0;
  const remainingBalance = cart?.remainingBalance ?? walletBalance - subtotal;
  const hasInsufficientBalance = walletBalance < subtotal;

  const updateQuantityOptimistic = useCallback(
  (itemId: string, newQty: number) => {
    if (newQty < 1) return;

    const currentCart = queryClient.getQueryData<B2BCart>(['v2-b2b-cart']);
    if (!currentCart) return;

    const updatedCart = {
      ...currentCart,
      items: currentCart.items.map((item) =>
        item._id === itemId ? { ...item, quantity: newQty } : item
      ),
    };

    updatedCart.subtotal = updatedCart.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (updatedCart.walletBalance !== undefined) {
      updatedCart.remainingBalance =
        updatedCart.walletBalance - updatedCart.subtotal;
    }

    queryClient.setQueryData(['v2-b2b-cart'], updatedCart);
  },
  [queryClient]
);
const debouncedUpdateApi = useCallback(
  (itemId: string, quantity: number) => {
    const existingTimer = debounceTimersRef.current.get(itemId);
    if (existingTimer) clearTimeout(existingTimer);

    const timer = setTimeout(() => {
      updateItemMutation.mutate({ itemId, quantity });
      debounceTimersRef.current.delete(itemId);
    }, 1000); // ⏱ 1 second delay

    debounceTimersRef.current.set(itemId, timer);
  },
  [updateItemMutation]
);

  
    const handleUpdateQuantity = (itemId: string, newQty: number) => {
  if (newQty < 1) return;

  // 1️⃣ UI instantly update
  updateQuantityOptimistic(itemId, newQty);

  // 2️⃣ API call after 1 second
  debouncedUpdateApi(itemId, newQty);
};

if (!isOpen) return null;


  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingCart className="text-brand-blue" size={24} />
            <h2 className="text-lg font-bold text-gray-900">B2B Cart</h2>
            {cart && cart.items.length > 0 && (
              <span className="px-2 py-0.5 bg-brand-blue text-white text-xs font-semibold rounded-full">
                {cart.items.length}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close cart"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="text-center py-8 text-gray-500">Loading cart...</div>
          ) : !cart || cart.items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="mx-auto text-gray-300 mb-4" size={48} />
              <p className="text-gray-500">Your cart is empty</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.items.map((item) => {
                const itemTotal = item.price * item.quantity;
                const { price: displayPrice } = getPrice({
                  amount: itemTotal,
                  currencyCode: item.currency || 'USD',
                });

                return (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.vendorProductId.title}</h3>
                        <p className="text-sm text-gray-500">{item.vendorProductId.vendorModel}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          SKU: {item.skuId.sku}
                          {item.skuId.metalColor && ` • ${item.skuId.metalColor}`}
                          {item.skuId.metalType && ` • ${item.skuId.metalType}`}
                          {item.skuId.size && ` • Size: ${item.skuId.size}`}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItemMutation.mutate(item._id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        aria-label="Remove item"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">Qty:</span>
                      <Counter
                        lang={lang}
                        value={item.quantity}
                        variant="mercury"
                        onDecrement={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                        onIncrement={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                      />
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{displayPrice}</p>
                        <p className="text-xs text-gray-500">
                          {item.currency || 'USD'} {item.price.toFixed(2)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t bg-gray-50 p-4 space-y-3">
            {/* Wallet Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 flex items-center gap-1">
                <DollarSign size={16} />
                Wallet Balance:
              </span>
              <span className={cn('font-semibold', hasInsufficientBalance ? 'text-red-600' : 'text-green-600')}>
                {walletBalance.toFixed(2)} {cart.items[0]?.currency || 'USD'}
              </span>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-semibold text-gray-900">
                {subtotal.toFixed(2)} {cart.items[0]?.currency || 'USD'}
              </span>
            </div>

            {/* Remaining Balance */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Remaining Balance:</span>
              <span className={cn('font-semibold', remainingBalance < 0 ? 'text-red-600' : 'text-green-600')}>
                {remainingBalance.toFixed(2)} {cart.items[0]?.currency || 'USD'}
              </span>
            </div>

            {hasInsufficientBalance && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2 text-xs text-red-700">
                Insufficient wallet balance. Please top up your wallet.
              </div>
            )}

            {/* Place Order Button */}
            <Button
              className="w-full"
              disabled={hasInsufficientBalance || isPlacingOrder || placeOrderMutation.isPending}
              loading={isPlacingOrder || placeOrderMutation.isPending}
              onClick={handlePlaceOrder}
            >
              Place Purchase Request
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

