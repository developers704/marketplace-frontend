'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import React, { useContext, useEffect, useState } from 'react';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { MdOutlineFileUpload } from 'react-icons/md';
import Link from 'next/link';
import QuantityCounter from '../common/quantity-counter';
import {
  deleteCartItem,
  updateCartItemQuantity,
} from '@/framework/basic-rest/cart/use-cart';
import { CartContext } from '@/contexts/cart/cart.context';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const CartItemComp = ({
  item,
  setTotal,
  setCartItems,
  setUpdate,
  update,
  lang = 'en',
}: any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const [quantity, setQuantity] = useState(item?.quantity);
  const [prevQuantity, setPrevQuantity] = useState<number>(item?.quantity);
  const { removeSingleItem } = useContext(CartContext);
  const router = useRouter();

  // console.log(quantity, '===>>>> quantity count');
  // console.log(item, '===>>>> itemsss');

  const updateQuantity = async () => {
    const response = await updateCartItemQuantity(
      item?.item._id,
      quantity,
      item?.itemType,
    );
    // console.log(response, '===>>>> response updateQuantity');
    if (response) {
      setTotal(response?.total);
    }
  };

  const handleItemRemove = async () => {
    const response = await deleteCartItem(
      item?.item?._id,
      item?.itemType,
      item?.color,
    );
    if (response && response?.message === 'Item removed successfully') {
      removeSingleItem(item?.item?._id);
      setUpdate(!update);
      // setCartItems(response?.cart.items);
      setTotal(response?.cart?.total);
      toast.success(response?.message, {position: 'bottom-right'});
      // console.log(response, '===>>>> response deleteCartItem');
    } else {
      toast.error(response?.message, { position: 'bottom-right' });
    }
  };

  const routeToProduct = () => {
    // href={`/${lang}/${data?.category[0].name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
    if (item?.itemType === 'SpecialProduct') {
      router.push(`/${lang}/specialProducts/${item?.item?._id}`);
    } else {
      router.push(
        `/${lang}/${item?.item?.category[0]?.name}/${
          item?.item?.subcategory[0]?.name
        }/${item?.item?.name}?id=${item?.item?._id}`,
      );
    }
  };

  useEffect(() => {
    if (quantity !== prevQuantity) {
      const delay = setTimeout(() => {
        updateQuantity();
        setPrevQuantity(quantity);
      }, 500); // Debounce delay

      return () => clearTimeout(delay);
    }
  }, [quantity, prevQuantity]);

  // console.log(item, '===>>>> item');

  return (
    <div className="flex items-center py-4 my-4">
      <div className="flex-1 w-full flex items-center gap-4">
        <Image
          src={getImageUrl(
            BASE_API as string,
            item?.item?.image || item?.item?.gallery[0],
            `/assets/images/products/item1.png`,
          )}
          alt="product"
          width={80}
          height={80}
          objectFit="contain"
        />
        <div className="flex flex-col">
          <span className="font-bold text-[20px]">{item?.item?.name}</span>
          {/* text-brand-mute */}
          <p className="text-[14px] text-brand-muted">SKU: {item?.item?.sku}</p>
          {item?.color && (
            <p className="text-[14px] text-brand-muted">
              Color: {item?.color || 'N/A'}
            </p>
          )}
        </div>
      </div>

      <div className="flex-1 w-full text-center text-[20px]">
        $ {item?.price}.00
      </div>
      <div className="flex-1 w-full text-center flex items-center justify-center">
        <QuantityCounter quantity={item?.quantity} setQuantity={setQuantity} />
      </div>
      <div className="flex-1 w-full text-center text-[20px]">
        $ {item?.price * quantity}
      </div>
      <div className="flex-1 w-full flex items-center justify-center gap-4">
        <RiDeleteBin6Line
          className="text-xl text-red-500 cursor-pointer"
          onClick={() => handleItemRemove()}
        />
        {/* <FaRegHeart className="text-xl cursor-pointer" /> */}
        <MdOutlineFileUpload
          className="text-xl text-blue-600 cursor-pointer"
          onClick={routeToProduct}
        />
      </div>
    </div>
  );
};

const AddToCartTable = ({
  lang,
  allCart,
  setUpdate,
  update,
}: {
  lang: string;
  allCart: any;
  setUpdate: any;
  update: any;
}) => {
  const [cartItems, setCartItems] = useState<any>([]);
  const [total, setTotal] = useState<number | any>(allCart?.total);

  // console.log(allCart, '====>>>> all cart');
  useEffect(() => {
    if (allCart && allCart.items) {
      setCartItems(allCart.items);
      setTotal(allCart?.total);
    }
  }, [allCart]);

  // console.log(cartItems, '===cartItems');

  return (
    <div>
      <div className="bg-[white] shadow flex items-center py-3">
        <div className="flex-1 w-full text-center font-semibold">Product</div>
        <div className="flex-1 w-full text-center font-semibold">Price</div>
        <div className="flex-1 w-full text-center font-semibold">Quantity</div>
        <div className="flex-1 w-full text-center font-semibold">Subtotal</div>
        <div className="flex-1 w-full text-center font-semibold">Action</div>
      </div>
      <div>
        {cartItems?.map((item: any) => (
          <CartItemComp
            key={item.id}
            item={item}
            setTotal={setTotal}
            setCartItems={setCartItems}
            setUpdate={setUpdate}
            update={update}
          />
        ))}
      </div>

      <div className="">
        {/* <p className="text-[12px] text-red-500 my-3">
          Lorem ipsum dolor sit, amet consectetur adipisicing elit. Tenetur
          omnis officiis sint dolorum rem. Deserunt suscipit magnam alias
          aliquid incidunt, excepturi placeat doloremque voluptas natus iure
          libero reiciendis odio quaerat!
        </p> */}
        <div className="flex items-center justify-between my-3 text-lg px-2">
          <span className="text-gray-600">Total Product Price</span>
          <span className="font-bold">$ {total}</span>
        </div>
        <div className="flex items-center justify-between my-3">
          <Link href={`/`}>
            <button className="border-gray-600 border py-2 px-5 rounded font-semibold">
              Return To Shop
            </button>
          </Link>
          <Link href={`/${lang}/checkout`}>
            <button className="bg-[#0081fe] py-2 px-5 rounded font-semibold text-white">
              Proceed to checkout
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AddToCartTable;
