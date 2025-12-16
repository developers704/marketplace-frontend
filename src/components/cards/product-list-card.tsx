'use client';
import Image from 'next/image';
import React, { useContext, useEffect, useState } from 'react';
import { FaHeart, FaRegHeart } from 'react-icons/fa';
import { MdAddShoppingCart } from 'react-icons/md';
import cn from 'classnames';
import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
import { useWishlist } from '@/contexts/wishlistContext';
import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
import { CartContext } from '@/contexts/cart/cart.context';
import { generateCartItem } from '@/utils/generate-cart-item';
import { getImageUrl } from '@/lib/utils';
import { PermissionsContext } from '@/contexts/permissionsContext';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';

interface ProductListCardProps {
  data: any;
  type:
    | 'SUPPLY'
    | 'NEW-PRODUCT'
    | 'PACKAGING'
    | 'STANDARD'
    | 'INVENTORY'
    | 'TOOLS';
  standardClassName?: string;
  lang?: string | any;
  isInWishlist?: any;
  setUpdateList?: any;
  updateList?: any;
  wishlist?: any;
  setWishlist?: any;
}

const ProductListCard = ({
  data,
  type,
  standardClassName,
  lang,
  isInWishlist,
  setUpdateList,
  updateList,
  wishlist,
  setWishlist,
}: ProductListCardProps) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const [isWishlist, setIsWishlist] = useState<boolean | any>(false);
  const [colorVariants, setColorVariants] = useState<any>([]);
  const [selectedColor, setSelectedColor] = useState<any>('W');
  const { permissions } = useContext(PermissionsContext);
  const [loginWarehouse, setLoginWarehouse] = useState<any>();
  const key = 'Cart';

const categoryName = data?.category?.[0]?.name || 'uncategorized';
const subcategoryName = data?.subcategory?.[0]?.name || 'general';

const { data: user, isLoading: userLoading } = useUserDataQuery()


  const {
    wishlist: wishlistContext,
    addToWishlist,
    removeFromWishlist,
  } = useWishlist();

  const {
    addToCart: addToCartContext,
    // getCartLength,
  } = useContext(CartContext);

  // const { wishlist, setWishlist } = useWishlist();
  // console.log(data, '===>>> data inside product list card');

  const handleToggleWishlist = async ({
    data,
    productType = 'regular',
  }: any) => {
    const productId = data?._id
    try {
      const isInWishlist = wishlist?.some(
        (item: any) => item?.product._id === productId,
      );
      
      if (isInWishlist) {
        // Remove from wishlist
        const response = await deleteWishlistItem(productId);

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

        const response = await addWishListItem(productId, productType , data);

        if (response.message === `Invalid token. Please log in again.`) {
          toast.error(`Please log in to add item to wishlist.`, {
            position: 'bottom-right',
          });

          return;
        } else if (response.message === 'Product added to wishlist') {
          toast.success(`Item added to wishlist.`, {
            position: 'bottom-right',
          });
          addToWishlist({ product: { _id: productId } });
          setUpdateList(!updateList);
        } else {
          toast.error(`Something went wrong.`, { position: 'bottom-right' }); // Revert state
        }
      }
    } catch (error) {
      console.error('Wishlist toggle error:', error);
      // toast.error(`Please log in to add item to wishlist.`, {
      //   position: 'top-right',
      // });
    }
  };

  const item = generateCartItem(data, 1, selectedColor);
  // console.log(item, '===> item to add to cart is here ');
  async function addToCart(isMainFlag: any) {
    try {

      const response = await addToCartApi(item, isMainFlag);
      // console.log(response, '===> responseasd');
      if (response.message === 'Error processing request') {
        toast.error('Please login to add item to cart', {
          // progressClassName: 'fancy-progress-bar',
          autoClose: 1500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          position: 'bottom-right',
        });
        return;
      }
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
        addToCartContext({
          item: { _id: item?.id },
          price: item?.price,
          quantity: item?.quantity,
        }); // ====>>> working
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
    } catch (error) {
      // console.log(error, '===>>> error');
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

  // console.log(data, 'data');

const colorOrder = ["w", "y", "r"];

const getColors = () => {
  if (!Array.isArray(data?.metal_color)) return;

  const colors = (Array.from(
    new Set(data.metal_color.map((c: string) => c.toUpperCase()))
  ) as string[]).sort((a: string, b: string) => colorOrder.indexOf(a) - colorOrder.indexOf(b));

  setColorVariants(colors);
};


  useEffect(() => {
    if (data) {
      getColors();
    }
  }, []);
  
        useEffect(() => {
        if (!userLoading) {
        const savedWarehouse = localStorage.getItem('selectedWarehouse');
  
        if (savedWarehouse) {
        try {
          const parsedWarehouse = JSON.parse(savedWarehouse);
          setLoginWarehouse(parsedWarehouse);
        } catch (error) {
          console.error("Failed to parse saved warehouse:", error);
          setLoginWarehouse(null);
        }
      } else {
        console.warn("No saved warehouse found in localStorage.");
        setLoginWarehouse(null);
      }
    }
  }, [userLoading]);

  const isMyWarehouseProduct = data?.warehouses?._id === loginWarehouse?._id;


  // console.log(colorVariants, '===>>> colorVariants');
  return (
    <>
      {type === 'NEW-PRODUCT' ? (
        <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
          <div className="flex items-center justify-between absolute w-full rounded-lg bg-white top-0 py-2 px-4">
            <p className="text-lg font-semibold">New</p>
            <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
            {/* <StarIcon /> */}
          </div>
          <div id="top" className="w-full ">
            <Image
              src={`/assets/images/products/item1.png`}
              alt="item1"
              width={500} // Adjust as needed
              height={500} // Adjust as needed
              // layout="responsive"
              className="w-full"
            />
          </div>
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-4"
          >
            <div>
              <p className="text-2xl font-bold">Earrings</p>
            </div>
            <div className="flex h-6 flex-col group-hover:flex-row-reverse transition ease-in-out duration-150 group-hover:items-center group-hover:justify-between gap-2">
              <div className="flex gap-2 ">
                <div className="w-8 h-8 rounded-md flex justify-center items-center bg-black text-white p-2">
                  <p className="">W</p>
                </div>
                <div className="w-8 h-8 rounded-md flex justify-center items-center bg-black text-white p-2">
                  <p className="">Y</p>
                </div>
                <div className="w-8 h-8 rounded-md flex justify-center items-center bg-black text-white p-2">
                  <p className="">R</p>
                </div>
              </div>
              <div>
                <p className="text-xl font-bold">$ 400</p>
              </div>
            </div>
            <button className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150">
              Add To Cart
            </button>
          </div>
        </div>
      ) : type === 'SUPPLY' ? (
        <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
          <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
            <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
            {/* <StarIcon /> */}
          </div>
          <div id="top" className="w-full h-[250px] object-contain relative">
            <Image
              src={`/assets/images/products/supply1.png`}
              alt="item1"
              fill
              objectFit="contain"
            />
          </div>
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-4"
          >
            <div>
              <p className="text-2xl font-bold">Coffee Cups</p>
            </div>
            <div className="flex h-6 flex-col gap-2">
              <div>
                <div className="text-lg font-semibold  ">
                  Unity type: <span className="text-[#3A7BD5]">Box</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : type === 'PACKAGING' ? (
        <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
          <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
            <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
            {/* <StarIcon /> */}
          </div>
          <div
            id="top"
            className="w-full flex justify-center items-center h-[250px] object-contain relative"
          >
            <Image
              src={`/assets/images/products/packaging.png`}
              alt="item1"
              fill
              objectFit="contain"
            />
          </div>
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-2"
          >
            <div>
              <p className="text-2xl font-semibold">Gift Watch</p>
            </div>
            <div className="flex h-6 flex-col transition ease-in-out duration-150 gap-2">
              <div>
                <p className="text-xl font-normal text-[#3A7BD5]">$ 400</p>
              </div>
            </div>
            <button className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150">
              Add To Cart
            </button>
          </div>
        </div>
      ) : type === 'STANDARD' ? (
        <div
          className={cn(
            'cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300 max-h-[420px]',
            standardClassName,
            data?.isOutOfStock && 'cursor-not-allowed opacity-60',
          )}
        >
          {/* Out of Stock Badge */}
          {data?.isOutOfStock && (
            <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold ">
              Out of Stock
            </div>
          )}

          <div className="flex items-center justify-end absolute w-full rounded-lg  top-0 py-2 px-4 z-10 ">
            {/* <p className="text-lg font-semibold">New</p> */}
            {!data?.isOutOfStock && (
              <>
              {
              isMyWarehouseProduct ? (
              // Disable Wishlist when the product is already in my inventory
              <FaRegHeart
              className="text-lg text-gray-400 cursor-not-allowed opacity-50"
              />
              ) : isInWishlist ? (
                  <FaHeart
                    className="cursor-pointer text-lg text-red-500"
                    onClick={() =>
                      handleToggleWishlist({data})
                    }
                  />
                )
                 : (
                  <FaRegHeart
                    className="cursor-pointer text-lg hover:text-gray-400"
                    onClick={() =>
                      handleToggleWishlist({data})
                    }
                  />
                )}
              </>
            )}
            {/* <StarIcon /> */}
          </div>
          {data?.isOutOfStock ? (
            <div
              id="top"
              className="w-full h-[250px] p-2 object-contain relative cursor-not-allowed"
            >
              <Image
                src={getImageUrl(BASE_API, data?.gallery[0] || data?.image, `/assets/images/products/item1.png`)}
                alt="item1"
                fill
                objectFit="contain"
                className="p-2"
              />
            </div>
          ) : (
            <Link
              id="top"
              className="w-full h-[250px] p-2 object-contain relative "
              // href={`/${lang}`}
              href={{
              pathname: `/${lang}/${categoryName}/${subcategoryName}/${data?.name || "product"}`,
              query: { id: data?._id, sellerWarehouseId: data?.warehouses?._id, m: data?.warehouses?.isMain},
            }}
            >
              <Image
                src={getImageUrl(BASE_API, data?.gallery?.[0] || data?.image, `/assets/images/products/item1.png`)}
                alt="item1"
                fill
                objectFit="contain"
                className="p-2"
              />
            </Link>
          )}
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-4 h-[180px]  "
            // href={`/${lang}/${data?.category[0].name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
          >
            {data?.isOutOfStock ? (
              <p className="text-xl font-semibold truncate whitespace-nowrap cursor-not-allowed pb-3 ">
                {data?.name}
              </p>
            ) : (
             <Link
             href={{
             pathname: `/${lang}/${categoryName}/${subcategoryName}/${data?.name || "product"}`,
            query: { id: data?._id, sellerWarehouseId: data?.warehouses?._id },
            }}
            >
                <p className="text-xl font-semibold truncate whitespace-nowrap mb-3">
                  {data?.name}
                </p>
              </Link>
            )}
            <div className="flex h-9 flex-col group-hover:flex-col  transition ease-in-out duration-150 mb-10">
              <div className="flex gap-2 group-hover:justify-end group-hover:items-end">
                {!data?.isOutOfStock && colorVariants.length > 0 ? (
                  colorVariants?.map((item: any) => {
                    const isSelected = selectedColor === item;
                    return (
                      <div
                        className={`w-10 h-7  rounded-md flex justify-center capitalize items-center ${isSelected ? 'bg-black ' : 'bg-white'}  ${isSelected ? 'text-white ' : 'text-black'}  p-2`}
                        onClick={() => setSelectedColor(item)}
                      >
                        <p className="">{item}</p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
                      <p className="text-black">W</p>
                      <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
                    </div>

                    <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
                      <p className="text-black">Y</p>
                      <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
                    </div>

                    <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
                      <p className="text-black">R</p>
                      <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
                    </div>
                  </>
                )}
              </div>
              <div className="flex align-items-center justify-between mt-2 ">
                <p className="text-xl font-bold text-brand-blue">
                  $ {data?.prices[0]?.amount || "N/A"} 
                </p>
                <p className="  text-brand-blue">
                   Qty {data?.quantity || "N/A"} 
                </p>
              </div>
              <div className="flex align-items-center justify-between ">
                <p className="  text-brand-blue">
                  Store {data?.warehouses.name || "N/A"} 
                </p>
                <p className="  text-brand-blue">
                   SKU {data?.sku || "N/A"} 
                </p>
              </div>
            </div>
              {!data?.isOutOfStock && permissions[key]?.View ? (
              isMyWarehouseProduct  ? (
                <button
                  className="invisible group-hover:visible cursor-not-allowed text-start w-fit py-3 px-4 text-sm font-semibold rounded-tr-[20px] rounded-bl-[20px] hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150"
                  // onClick={ () => addToCart(data)}
                  // onClick={ () => alert("allready available in your store")}
                >
                      Available in My Store
                </button>
              ) : data.warehouses?.isMain ? (
                <button
                  className="invisible group-hover:visible text-start w-fit py-3 px-4 text-sm font-semibold rounded-tr-[20px] rounded-bl-[20px] hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150"
                  onClick={ () => addToCart(data)}
                >
                  Add To Cart
                </button>
              ) : (
                <button
                  className="invisible group-hover:visible text-start w-fit py-3 px-4 text-sm font-semibold rounded-tr-[20px] rounded-bl-[20px] hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150"
                  onClick={ () => addToCart(data)}
                >
                
                  Request to Admin
                </button>
              )
            ) : (
              <button
                className="text-start w-fit py-3 px-4 text-lg font-semibold rounded-tr-[20px] rounded-bl-[20px] bg-gray-300 text-gray-500 cursor-not-allowed"
                disabled
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      ) : type === 'INVENTORY' ? (
        <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
          {data.isOutOfStock && (
            <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              Out of Stock
            </div>
          )}
          <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
            <span className="text-sm font-medium text-gray-600">SKU: {data.sku}</span>
          </div>
          <div id="top" className="w-full h-[200px] object-contain relative">
            <Image
              src={data.image || `/assets/images/inventory/item2.png`}
              alt={data.name}
              fill
              objectFit="contain"
            />
          </div>
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-2"
          >
            <div>
              <p className="text-xl font-bold mb-2">{data.name}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Quantity:</span>
                <span className={`text-lg font-bold ${Number(data.prices[0]?.amount) <= data.stockAlert ? 'text-red-600' : 'text-green-600'}`}>
                  {data.prices[0]?.amount || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Alert Threshold:</span>
                <span className="text-sm text-gray-600">{data.stockAlert}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold">Location:</span>
                <span className="text-sm text-gray-600">{data.locationWithinWarehouse || 'N/A'}</span>
              </div>
              {data.barcode && (
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Barcode:</span>
                  <span className="text-sm text-gray-600">{data.barcode}</span>
                </div>
              )}
              <div className="mt-2 pt-2 border-t">
                <p className="text-xs text-gray-500 mb-1">Available in:</p>
                <div className="flex flex-wrap gap-1">
                  {/* {data.warehouses?.map((wh: any) => (
                    <span key={wh._id} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {wh.name}
                    </span>
                  ))} */}
                  <span  className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {data.warehouse?.name || 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : type === 'TOOLS' ? (
        <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
          <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
            <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
            {/* <StarIcon /> */}
          </div>
          <div id="top" className="w-full h-[250px] object-contain relative">
            <Image
              src={`/assets/images/tools/item1.png`}
              alt="item1"
              fill
              objectFit="contain"
            />
          </div>
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-4"
          >
            <div>
              <p className="text-2xl font-bold">{'Tool Kit'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-lg font-semibold text-[#3A7BD5] flex items-center justify-between ">
                  $ price{' '}
                  <span className="">
                    <MdAddShoppingCart className="text-2xl" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ''
      )}
    </>
  );
};

export default ProductListCard;
