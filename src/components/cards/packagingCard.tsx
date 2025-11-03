import { CartContext } from '@/contexts/cart/cart.context';
import { useWishlist } from '@/contexts/wishlistContext';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import { generateCartItem } from '@/utils/generate-cart-item';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import React, { useContext, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdAddShoppingCart } from 'react-icons/md';
import { toast } from 'react-toastify';

const PackagingCard = ({
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
      // console.error('Wishlist toggle error:', error);
      toast.error(`Please Log in to add item.`, {
        position: 'bottom-right',
      });
    }
  };

  const item = generateCartItem(data, 1);

  async function addToCart() {
    // console.log(selectedQuantity, '===> selectedQuantity');
    // console.log(item, '===> cart items');

    const response = await addToCartApi(item);
    // console.log(response, '===> response');
    if (response.items.length > 0) {
      toast.success('Added to cart', {
        progressClassName: 'fancy-progress-bar',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        position: 'bottom-right',
      });
      addToCartContext({ item: { _id: item?.id } }); // ====>>> working
    } else {
      toast.error('Something went wrong', {
        // progressClassName: 'fancy-progress-bar',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        position: 'bottom-right',
      });
    }
  }

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
        href={`/${lang}/GWP/${data?._id}`}
        id="top"
        className="w-full flex justify-center items-center h-[250px] object-contain relative"
      >
        <Image
          src={getImageUrl(BASE_API as string, data?.image, `/assets/images/products/packaging.png`)}
          alt="item1"
          fill
          objectFit="contain"
        />
      </Link>
      <Link
        href={`/${lang}/GWP/${data?._id}`}
        id="bottom"
        className="flex flex-col justify-center px-5 py-3 gap-2"
      >
        <div>
          <p className="text-2xl font-semibold truncate">{data?.name}</p>
        </div>
        <div className="flex h-6 flex-col transition ease-in-out duration-150 gap-2">
          <div className="flex justify-between items-center ">
            <p className="text-2xl font-bold text-brand-blue">
              $ {data?.prices[0]?.amount}
            </p>
            <span className="" onClick={addToCart}>
              <MdAddShoppingCart className="text-3xl font-bold text-brand-blue" />
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default PackagingCard;
