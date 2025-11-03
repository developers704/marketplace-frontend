'use client';
import { CartContext } from '@/contexts/cart/cart.context';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import { generateCartItem } from '@/utils/generate-cart-item';
import Image from 'next/image';
import React, { useContext } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { toast } from 'react-toastify';

const WishlistItem = ({
  product,
  setUpdateList,
  updateList,
  removeFromWishlist,
}: any) => {
  // console.log(product, '===>>> product');
  const {
    addToCart: addToCartContext,
    //  removeSingleItem,
    //  increaseQuantity,
    // getCartLength,
  } = useContext(CartContext);
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const { permissions } = useContext(PermissionsContext);
  const key = 'Cart';

  const handleRemove = async (productId: any) => {
    if (Object.keys(product).includes('specialCategory')) {
      const response = await deleteWishlistItem(productId, 'special');
      if (response) {
        removeFromWishlist(productId);
      }
      // console.log(response, '===>>> response');
      setUpdateList(!updateList);
    } else {
      const response = await deleteWishlistItem(productId, 'regular');
      if (response) {
        removeFromWishlist(productId);
      }
      // console.log(response, '===>>> response');
      setUpdateList(!updateList);
    }
  };

  const item = generateCartItem(product, 1);

  async function addToCart() {
    // console.log(selectedQuantity, '===> selectedQuantity');
    // console.log(item, '===> cart items');
    if (item) {
      const response = await addToCartApi(item);
      // console.log(response, '===> response');
      if (response.items.length > 0) {
        toast.success('Added to cart', {
          progressClassName: 'fancy-progress-bar',
          // position: width! > 768 ? 'bottom-right' : 'top-right',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          position: 'bottom-right',
        });
      }
      addToCartContext({ item: { _id: item?.id } }); // ====>>> working
    } else {
      console.log('Item is not available');
      toast.warning('Something went wrong. Please try again.', {
        // position: width! > 768 ? 'bottom-right' : 'top-right',
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
    <div className="flex items-center py-4 my-4">
      <div className="flex-1 w-full flex items-center gap-4">
        <Image
          src={
            `${BASE_API}/${product?.gallery[0]}` ||
            `/assets/images/products/item1.png`
          }
          alt="product"
          width={80}
          height={80}
          objectFit="contain"
        />
        <div className="flex flex-col">
          <span>{product?.name}</span>
          {/* text-brand-mute */}
          <p className="text-sm ">{product?.sku}</p>
        </div>
      </div>

      <div className="flex-1 w-full text-center">
        {product?.prices[0].amount}
      </div>
      <div className="flex-1 w-full flex items-center justify-center gap-4">
        <RiDeleteBin6Line
          className="text-2xl text-red-500 cursor-pointer"
          onClick={() => handleRemove(product._id)}
        />
        {permissions[key]?.View && (
          <MdAddShoppingCart
            className="text-2xl text-blue-600 cursor-pointer"
            onClick={() => addToCart()}
          />
        )}
      </div>
    </div>
  );
};

export default WishlistItem;
