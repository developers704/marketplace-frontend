'use client';
import { CartContext } from '@/contexts/cart/cart.context';
import { useWishlist } from '@/contexts/wishlistContext';
import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
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

        const response = await addWishListItem(productId, productType);

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

  // console.log(data, 'data');

  return (
    <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
      <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
        {isInWishlist ? (
          <FaHeart
            className="cursor-pointer text-lg text-red-500"
            onClick={() => handleToggleWishlist({ productId: data?._id })}
          />
        ) : (
          <FaRegHeart
            className="cursor-pointer text-lg hover:text-gray-400"
            onClick={() => handleToggleWishlist({ productId: data?._id })}
          />
        )}
        {/* <StarIcon /> */}
      </div>
      <Link
        href={`/${lang}/supplies/${data?._id}`}
        id="top"
        className="w-full h-[250px] object-contain relative"
      >
        <Image
          src={getImageUrl(BASE_API as string, data?.image, `/assets/images/inventory/item2.png`)}
          alt="item1"
          fill
          objectFit="contain"
        />
      </Link>
      <Link
        href={`/${lang}/supplies/${data?._id}`}
        id="bottom"
        className="flex flex-col justify-center px-4 py-3 gap-4"
      >
        <div>
          <p className="text-2xl font-bold truncate">{data?.name}</p>
        </div>
        <div className="flex h-6 flex-col gap-2">
          <div>
            <div className="text-lg font-bold">
              Category:{' '}
              <span className="text-lg font-bold text-brand-blue">
                {data?.specialCategory?.name}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default SuppliesCard;
