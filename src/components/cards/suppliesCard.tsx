'use client';
import { CartContext } from '@/contexts/cart/cart.context';
import { useWishlist } from '@/contexts/wishlistContext';
import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import { generateCartItem } from '@/utils/generate-cart-item';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { ShoppingCart } from 'lucide-react';
import { toast } from 'react-toastify';

const SuppliesCard = ({
  data,
  lang,
  setUpdateList,
  updateList,
  isInWishlist,
  wishlist,
  setWishlist,
}: any) => {
  const [variant, setVariant] = useState<any>();
  const [addToCartLoader, setAddToCartLoader] = useState(false);
  const {
    wishlist: wishListContext,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const {
    addToCart: addToCartContext,
    // getCartLength,
  } = useContext(CartContext);

  const handleToggleWishlist = async ({
    productId,
    productType = 'special',
  }: any) => {
    try {
      const isInWishlist = wishlist?.some(
        (item: any) => item?.product._id === productId,
      );

      if (isInWishlist) {
        // Remove from wishlist
        const response = await deleteWishlistItem(productId, productType);

        if (response.message === 'Product removed from wishlist') {
          toast.success(`Item removed from wishlist.`, {
            position: 'bottom-right',
          });
          removeFromWishlist(productId);
          setUpdateList(!updateList);
        } else {
          toast.error(`Something went wrong.`, { position: 'bottom-right' });
        }
      } else {
        // Add to wishlist

        const response = await addWishListItem(productId, productType, { warehouses: {} });

        if (response.message === `Invalid token. Please log in again.`) {
          toast.error(`Please log in to add item to wishlist.`, {
            position: 'bottom-right',
          });

          return;
        } else if (response.message === 'Product added to wishlist') {
          toast.success(`Item added to wishlist.`, { position: 'bottom-right' });
          addToWishlist({ product: { _id: productId } });
          setUpdateList(!updateList);
        } else {
          toast.error(`Something went wrong.`, { position: 'bottom-right' }); // Revert state
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      toast.error(`Something went wrong. Please try again later.`, {
        position: 'bottom-right',
      });
    }
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      setAddToCartLoader(true);
      // @ts-ignore - generateCartItem third parameter is optional
      const item = generateCartItem(data, 1);
      const response = await addToCartApi(item, null);
      
      if (response.items && response.items.length > 0) {
        toast.success('Added to cart', {
          position: 'bottom-right',
          autoClose: 1500,
        });
        addToCartContext({ item: { _id: item?.id } });
      } else {
        toast.error(response.message || 'Failed to add to cart', {
          position: 'bottom-right',
        });
      }
    } catch (error) {
      console.error('Add to cart error:', error);
      toast.error('Something went wrong. Please try again.', {
        position: 'bottom-right',
      });
    } finally {
      setAddToCartLoader(false);
    }
  };

  const price = data?.prices?.[0]?.amount || 0;
  const salePrice = data?.prices?.[0]?.salePrice;

  return (
    <div className="group relative w-full flex flex-col bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-gray-200 hover:-translate-y-1">
      {/* Wishlist Button */}
      <div className="absolute top-3 right-3 z-20">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleToggleWishlist({ productId: data?._id });
          }}
          className="p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-md hover:bg-white transition-all duration-200 hover:scale-110"
        >
          {isInWishlist ? (
            <FaHeart className="text-lg text-red-500" />
          ) : (
            <FaRegHeart className="text-lg text-gray-600 hover:text-red-500 transition-colors" />
          )}
        </button>
      </div>

      {/* Product Image */}
      <Link
        href={`/${lang}/supplies/${data?._id}`}
        className="relative w-full h-[280px] bg-gray-50 overflow-hidden"
      >
        <Image
          src={getImageUrl(BASE_API as string, data?.image, `/assets/images/inventory/item2.png`)}
          alt={data?.name || 'Product'}
          fill
          className="object-contain group-hover:scale-105 transition-transform duration-300"
          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
      </Link>

      {/* Product Info */}
      <div className="flex flex-col p-4 gap-3 flex-1">
        {/* Category Badge */}
        {data?.specialCategory?.name && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-brand-blue bg-blue-50 px-2 py-1 rounded-full">
              {data.specialCategory.name}
            </span>
          </div>
        )}

        {/* Product Name */}
        <Link href={`/${lang}/supplies/${data?._id}`}>
          <h3 className="text-lg font-bold text-gray-900 line-clamp-2 hover:text-brand-blue transition-colors">
            {data?.name}
          </h3>
        </Link>

        {/* SKU */}
        {data?.sku && (
          <p className="text-xs text-gray-500">SKU: {data.sku}</p>
        )}

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-gray-900">
            ${price.toFixed(2)}
          </span>
          {salePrice && salePrice < price && (
            <span className="text-lg text-gray-500 line-through">
              ${salePrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Stock Status */}
        <div className="flex items-center gap-2">
          {data?.stock !== undefined && (
            <span className={`text-xs font-medium px-2 py-1 rounded ${
              data.stock > 0 
                ? 'text-green-700 bg-green-50' 
                : 'text-red-700 bg-red-50'
            }`}>
              {data.stock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={addToCartLoader || (data?.stock !== undefined && data.stock === 0)}
          className="w-full mt-auto flex items-center justify-center gap-2 bg-brand-blue hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-md active:scale-95"
        >
          {addToCartLoader ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Adding...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={18} />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default SuppliesCard;
