'use client';
import { CartContext } from '@/contexts/cart/cart.context';
import { useWishlist } from '@/contexts/wishlistContext';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import { generateCartItem } from '@/utils/generate-cart-item';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import React, { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { toast } from 'react-toastify';

const InventoryCard = ({
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
        (item: any) => item?.product?._id === productId,
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

  //   const item = generateCartItem(data, 1);

  //   async function addToCart() {
  //     // console.log(selectedQuantity, '===> selectedQuantity');
  //     // console.log(item, '===> cart items');
  //     // if (item) {
  //     //   setAddToCartLoader(true);
  //     //   setTimeout(() => {
  //     //     setAddToCartLoader(false);
  //     //   }, 1500);
  //     const response = await addToCartApi(item);
  //     // console.log(response, '===> response');
  //     if (response.items.length > 0) {
  //       toast.success('Added to cart', {
  //         progressClassName: 'fancy-progress-bar',
  //         autoClose: 1500,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
  //       addToCartContext(item); // ====>>> working
  //     } else {
  //       toast.error('Something went wrong', {
  //         // progressClassName: 'fancy-progress-bar',
  //         autoClose: 1500,
  //         hideProgressBar: false,
  //         closeOnClick: true,
  //         pauseOnHover: true,
  //         draggable: true,
  //       });
  //     }
  //     // } else {
  //     //   console.log('Item is not available');
  //     //   toast.warning('Something went wrong. Please try again.', {
  //     //     // position: width! > 768 ? 'bottom-right' : 'top-right',
  //     //     autoClose: 1500,
  //     //     hideProgressBar: false,
  //     //     closeOnClick: true,
  //     //     pauseOnHover: true,
  //     //     draggable: true,
  //     //   });
  //     // }
  //   }
  const getVariants = () => {
    if (!data || typeof data !== 'object') {
      console.log('Invalid data structure');
      return;
    }

    // Extract productVariants from the single object
    const allVariants = data.productVariants || [];

    if (!Array.isArray(allVariants) || allVariants.length === 0) {
      // console.log('No product variants found');
      return;
    }

    // Reduce to format { Size: [12, 13] }
    const formattedVariants = allVariants.reduce((acc: any, variant: any) => {
      const key = variant?.variantName?.name; // Ensure variantName and name exist
      const value = variant?.value; // Extract variant value

      if (!key || !value) return acc; // Skip invalid entries

      if (!acc[key]) {
        acc[key] = new Set(); // Use Set to avoid duplicates
      }

      acc[key].add(value); // Add value to the Set
      return acc;
    }, {});

    // Convert to desired array format: [{ Size: [12, 13] }, { OtherVariant: [values] }]
    const result = Object.entries(formattedVariants).map(([key, set]: any) => ({
      [key]: Array.from(set),
    }));

    //   console.log(result, 'variants gettt');
    setVariant(result);
  };

  useEffect(() => {
    getVariants();
  }, [data]);

  //   console.log(variant, '===> variant');
  // console.log(data, 'inventoryCard');

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
        //   ${data?.category[0].name}/${data?.category[0].name}/${data?._id}
        href={`/${lang}/inventory-orders/${data?._id}`}
        id="top"
        className="w-full h-[250px] object-contain relative"
      >
        {/* `${BASE_API}/${data?.image}` ||  */}
        <Image
          src={getImageUrl(BASE_API as string, data?.image, `/assets/images/inventory/item2.png`)}
          alt="item1"
          fill
          objectFit="contain"
        />
      </Link>
      <Link
        href={`/${lang}/inventory-orders/${data?._id}`}
        id="bottom"
        className="flex flex-col justify-center px-4 py-3 gap-4"
      >
        <div>
          <p className="text-2xl font-bold">{data?.name}</p>
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <div className="text-2xl font-bold text-brand-blue">
              <span className="">
                $ {data?.prices[0]?.amount}
              </span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default InventoryCard;
