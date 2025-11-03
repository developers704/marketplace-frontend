// 'use client';
// import Image from 'next/image';
// import React, { useContext, useEffect, useState } from 'react';
// import { FaHeart, FaRegHeart } from 'react-icons/fa';
// import { MdAddShoppingCart } from 'react-icons/md';
// import cn from 'classnames';
// import { addWishListItem } from '@/framework/basic-rest/wishlist/add-wishlist';
// import { toast } from 'react-toastify';
// import Link from 'next/link';
// import { deleteWishlistItem } from '@/framework/basic-rest/wishlist/delete-wishlist-item';
// import { useWishlist } from '@/contexts/wishlistContext';
// import { addToCartApi } from '@/framework/basic-rest/cart/use-cart';
// import { CartContext } from '@/contexts/cart/cart.context';
// import { generateCartItem } from '@/utils/generate-cart-item';
// import { PermissionsContext } from '@/contexts/permissionsContext';

// interface ProductListCardProps {
//   data: any;
//   type:
//     | 'SUPPLY'
//     | 'NEW-PRODUCT'
//     | 'PACKAGING'
//     | 'STANDARD'
//     | 'INVENTORY'
//     | 'TOOLS';
//   standardClassName?: string;
//   lang?: string | any;
//   isInWishlist?: any;
//   setUpdateList?: any;
//   updateList?: any;
//   wishlist?: any;
//   setWishlist?: any;
// }

// const ProductListCard = ({
//   data,
//   type,
//   standardClassName,
//   lang,
//   isInWishlist,
//   setUpdateList,
//   updateList,
//   wishlist,
//   setWishlist,
// }: ProductListCardProps) => {
//   const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
//   const [isWishlist, setIsWishlist] = useState<boolean | any>(false);
//   const [colorVariants, setColorVariants] = useState<any>([]);
//   const [selectedColor, setSelectedColor] = useState<any>('W');
//   const { permissions } = useContext(PermissionsContext);
//   const key = 'Cart';

//   const {
//     wishlist: wishlistContext,
//     addToWishlist,
//     removeFromWishlist,
//   } = useWishlist();

//   const {
//     addToCart: addToCartContext,
//     // getCartLength,
//   } = useContext(CartContext);

//   // const { wishlist, setWishlist } = useWishlist();
//   console.log(data, '===>>> data inside product list card');

//   const handleToggleWishlist = async ({
//     productId,
//     productType = 'regular',
//   }: any) => {
//     try {
//       const isInWishlist = wishlist?.some(
//         (item: any) => item?.product._id === productId,
//       );

//       if (isInWishlist) {
//         // Remove from wishlist
//         const response = await deleteWishlistItem(productId);

//         if (response.message === 'Product removed from wishlist') {
//           toast.success(`Item removed from wishlist.`, {
//             position: 'bottom-right',
//           });
//           removeFromWishlist(productId);
//           setUpdateList(!updateList);
//         } else {
//           toast.error(`Something went wrong.`, { position: 'bottom-right' });
//         }
//       } else {
//         // Add to wishlist

//         const response = await addWishListItem(productId, productType);

//         if (response.message === `Invalid token. Please log in again.`) {
//           toast.error(`Please log in to add item to wishlist.`, {
//             position: 'bottom-right',
//           });

//           return;
//         } else if (response.message === 'Product added to wishlist') {
//           toast.success(`Item added to wishlist.`, {
//             position: 'bottom-right',
//           });
//           addToWishlist({ product: { _id: productId } });
//           setUpdateList(!updateList);
//         } else {
//           toast.error(`Something went wrong.`, { position: 'bottom-right' }); // Revert state
//         }
//       }
//     } catch (error) {
//       console.error('Wishlist toggle error:', error);
//       // toast.error(`Please log in to add item to wishlist.`, {
//       //   position: 'top-right',
//       // });
//     }
//   };

//   const item = generateCartItem(data, 1, selectedColor);

//   async function addToCart() {
//     try {
//       const response = await addToCartApi(item);
//       // console.log(response, '===> responseasd');
//       if (response.message === 'Error processing request') {
//         toast.error('Please login to add item to cart', {
//           // progressClassName: 'fancy-progress-bar',
//           autoClose: 1500,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           position: 'bottom-right',
//         });
//         return;
//       }
//       if (response.items.length > 0) {
//         toast.success('Added to cart', {
//           progressClassName: 'fancy-progress-bar',
//           autoClose: 1500,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           position: 'bottom-right',
//         });
//         addToCartContext({
//           item: { _id: item?.id },
//           price: item?.price,
//           quantity: item?.quantity,
//         }); // ====>>> working
//       } else {
//         toast.error('Something went wrong', {
//           // progressClassName: 'fancy-progress-bar',
//           autoClose: 1500,
//           hideProgressBar: false,
//           closeOnClick: true,
//           pauseOnHover: true,
//           draggable: true,
//           position: 'bottom-right',
//         });
//       }
//     } catch (error) {
//       console.log(error, '===>>> error');
//       toast.error('Something went wrong', {
//         // progressClassName: 'fancy-progress-bar',
//         autoClose: 1500,
//         hideProgressBar: false,
//         closeOnClick: true,
//         pauseOnHover: true,
//         draggable: true,
//         position: 'bottom-right',
//       });
//     }
//   }

//   // console.log(data, 'data');

//   const getColors = () => {
//     const filterColors = data?.variants?.filter(
//       (item: any) => item?.variantName?.name === 'Color',
//     );

//     if (filterColors?.length > 0) {
//       // Get unique colors using Set
//       const uniqueColors = new Set(
//         filterColors.map((item: any) => item?.value[0]),
//       );

//       // Update state with unique values only
//       setColorVariants(Array.from(uniqueColors));
//     }

//     // console.log(filterColors, '===>>> filterColors');
//   };

//   useEffect(() => {
//     if (data) {
//       getColors();
//     }
//   }, []);

//   // console.log(colorVariants, '===>>> colorVariants');
//   return (
//     <>
//       {type === 'NEW-PRODUCT' ? (
//         <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
//           <div className="flex items-center justify-between absolute w-full rounded-lg bg-white top-0 py-2 px-4">
//             <p className="text-lg font-semibold">New</p>
//             <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
//             {/* <StarIcon /> */}
//           </div>
//           <div id="top" className="w-full ">
//             <Image
//               src={`/assets/images/products/item1.png`}
//               alt="item1"
//               width={500} // Adjust as needed
//               height={500} // Adjust as needed
//               // layout="responsive"
//               className="w-full"
//             />
//           </div>
//           <div
//             id="bottom"
//             className="flex flex-col justify-center px-4 py-3 gap-4"
//           >
//             <div>
//               <p className="text-2xl font-bold">Earrings</p>
//             </div>
//             <div className="flex h-6 flex-col group-hover:flex-row-reverse transition ease-in-out duration-150 group-hover:items-center group-hover:justify-between gap-2">
//               <div className="flex gap-2 ">
//                 <div className="w-8 h-8 rounded-md flex justify-center items-center bg-black text-white p-2">
//                   <p className="">W</p>
//                 </div>
//                 <div className="w-8 h-8 rounded-md flex justify-center items-center bg-black text-white p-2">
//                   <p className="">Y</p>
//                 </div>
//                 <div className="w-8 h-8 rounded-md flex justify-center items-center bg-black text-white p-2">
//                   <p className="">R</p>
//                 </div>
//               </div>
//               <div>
//                 <p className="text-xl font-bold">$ 400</p>
//               </div>
//             </div>
//             <button className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150">
//               Add To Cart
//             </button>
//           </div>
//         </div>
//       ) : type === 'SUPPLY' ? (
//         <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
//           <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
//             <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
//             {/* <StarIcon /> */}
//           </div>
//           <div id="top" className="w-full h-[250px] object-contain relative">
//             <Image
//               src={`/assets/images/products/supply1.png`}
//               alt="item1"
//               fill
//               objectFit="contain"
//             />
//           </div>
//           <div
//             id="bottom"
//             className="flex flex-col justify-center px-4 py-3 gap-4"
//           >
//             <div>
//               <p className="text-2xl font-bold">Coffee Cups</p>
//             </div>
//             <div className="flex h-6 flex-col gap-2">
//               <div>
//                 <div className="text-lg font-semibold  ">
//                   Unity type: <span className="text-[#3A7BD5]">Box</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : type === 'PACKAGING' ? (
//         <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
//           <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
//             <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
//             {/* <StarIcon /> */}
//           </div>
//           <div
//             id="top"
//             className="w-full flex justify-center items-center h-[250px] object-contain relative"
//           >
//             <Image
//               src={`/assets/images/products/packaging.png`}
//               alt="item1"
//               fill
//               objectFit="contain"
//             />
//           </div>
//           <div
//             id="bottom"
//             className="flex flex-col justify-center px-4 py-3 gap-2"
//           >
//             <div>
//               <p className="text-2xl font-semibold">Gift Watch</p>
//             </div>
//             <div className="flex h-6 flex-col transition ease-in-out duration-150 gap-2">
//               <div>
//                 <p className="text-xl font-normal text-[#3A7BD5]">$ 400</p>
//               </div>
//             </div>
//             <button className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150">
//               Add To Cart
//             </button>
//           </div>
//         </div>
//       ) : type === 'STANDARD' ? (
//         <div
//           className={cn(
//             'cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300 max-h-[350px]',
//             standardClassName,
//           )}
//         >
//           <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
//             {/* <p className="text-lg font-semibold">New</p> */}
//             {isInWishlist ? (
//               <FaHeart
//                 className="cursor-pointer text-lg text-red-500"
//                 onClick={() => handleToggleWishlist({ productId: data?._id })}
//               />
//             ) : (
//               <FaRegHeart
//                 className="cursor-pointer text-lg hover:text-gray-400"
//                 onClick={() => handleToggleWishlist({ productId: data?._id })}
//               />
//             )}
//             {/* <StarIcon /> */}
//           </div>
//           <Link
//             id="top"
//             className="w-full h-[250px] p-2 object-contain relative "
//             // href={`/${lang}`}
//             href={`/${lang}/${data?.category[0]?.name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
//           >
//             <Image
//               src={
//                 `${BASE_API}/${data?.gallery[0] || data?.image}` ||
//                 `/assets/images/products/item1.png`
//               }
//               alt="item1"
//               fill
//               objectFit="contain"
//               className="p-2"
//             />
//           </Link>
//           <div
//             id="bottom"
//             className="flex flex-col justify-center px-4 py-3 gap-4 h-[150px]"
//             // href={`/${lang}/${data?.category[0].name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
//           >
//             <Link
//               href={`/${lang}/${data?.category[0]?.name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
//             >
//               <p className="text-xl font-semibold truncate whitespace-nowrap">
//                 {data?.name}
//               </p>
//             </Link>
//             <div className="flex h-6 flex-col group-hover:flex-row-reverse group-hover:items-center group-hover:justify-between transition ease-in-out duration-150 gap-2">
//               <div className="flex gap-2 group-hover:justify-end group-hover:items-end">
//                 {colorVariants.length > 0 ? (
//                   colorVariants?.map((item: any) => {
//                     const isSelected = selectedColor === item;
//                     return (
//                       <div
//                         className={`w-7 h-7 rounded-md flex justify-center capitalize items-center ${isSelected ? 'bg-black' : 'bg-white'}  ${isSelected ? 'text-white' : 'text-black'}  p-2`}
//                         onClick={() => setSelectedColor(item)}
//                       >
//                         <p className="">{item}</p>
//                       </div>
//                     );
//                   })
//                 ) : (
//                   <>
//                     {/* <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
//                       <p className="text-black">W</p>
//                       <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
//                     </div>

//                     <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
//                       <p className="text-black">Y</p>
//                       <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
//                     </div>

//                     <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
//                       <p className="text-black">R</p>
//                       <div className="absolute w-[120%] h-[2px] bg-red-500 border-t-2 border-red-500 transform rotate-45"></div>
//                     </div> */}
//                   </>
//                 )}
//               </div>
//               <div className="group-hover:">
//                 <p className="text-xl font-bold text-brand-blue">
//                   $ {data?.prices[0]?.amount}
//                 </p>
//               </div>
//             </div>
//             {permissions[key]?.View ? (
//               <button
//                 className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150"
//                 onClick={addToCart}
//               >
//                 Add To Cart
//               </button>
//             ) : (
//               <button
//                 className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg "
//                 onClick={addToCart}
//               ></button>
//             )}
//           </div>
//         </div>
//       ) : type === 'INVENTORY' ? (
//         <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
//           <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
//             <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
//             {/* <StarIcon /> */}
//           </div>
//           <div id="top" className="w-full h-[250px] object-contain relative">
//             <Image
//               src={`/assets/images/inventory/item2.png`}
//               alt="item1"
//               fill
//               objectFit="contain"
//             />
//           </div>
//           <div
//             id="bottom"
//             className="flex flex-col justify-center px-4 py-3 gap-4"
//           >
//             <div>
//               <p className="text-2xl font-bold">{'Table Top'}</p>
//             </div>
//             <div className="flex flex-col gap-2">
//               <div>
//                 <div className="text-lg font-semibold  ">
//                   Material: <span className="text-[#3A7BD5]">{'Paper'}</span>
//                 </div>
//               </div>
//               <div>
//                 <div className="text-lg font-semibold  ">
//                   Dimensions:{' '}
//                   <span className="text-[#3A7BD5]">{'72 x 24'}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : type === 'TOOLS' ? (
//         <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
//           <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
//             <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
//             {/* <StarIcon /> */}
//           </div>
//           <div id="top" className="w-full h-[250px] object-contain relative">
//             <Image
//               src={`/assets/images/tools/item1.png`}
//               alt="item1"
//               fill
//               objectFit="contain"
//             />
//           </div>
//           <div
//             id="bottom"
//             className="flex flex-col justify-center px-4 py-3 gap-4"
//           >
//             <div>
//               <p className="text-2xl font-bold">{'Tool Kit'}</p>
//             </div>
//             <div className="flex flex-col gap-2">
//               <div>
//                 <div className="text-lg font-semibold text-[#3A7BD5] flex items-center justify-between ">
//                   $ price{' '}
//                   <span className="">
//                     <MdAddShoppingCart className="text-2xl" />
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ) : (
//         ''
//       )}
//     </>
//   );
// };

// export default ProductListCard;


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
  const key = 'Cart';

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
    productId,
    productType = 'regular',
  }: any) => {
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

        const response = await addWishListItem(productId, productType);

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

  async function addToCart() {
    try {
      const response = await addToCartApi(item);
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
      console.log(error, '===>>> error');
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

  const getColors = () => {
    const filterColors = data?.variants?.filter(
      (item: any) => item?.variantName?.name === 'Color',
    );

    if (filterColors?.length > 0) {
      // Get unique colors using Set
      const uniqueColors = new Set(
        filterColors.map((item: any) => item?.value[0]),
      );

      // Update state with unique values only
      setColorVariants(Array.from(uniqueColors));
    }

    // console.log(filterColors, '===>>> filterColors');
  };

  useEffect(() => {
    if (data) {
      getColors();
    }
  }, []);

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
            'cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300 max-h-[350px]',
            standardClassName,
            data?.isOutOfStock && 'cursor-not-allowed opacity-60',
          )}
        >
          {/* Out of Stock Badge */}
          {data?.isOutOfStock && (
            <div className="absolute top-2 left-2 z-20 bg-red-500 text-white px-3 py-1 rounded-md text-sm font-semibold">
              Out of Stock
            </div>
          )}

          <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
            {/* <p className="text-lg font-semibold">New</p> */}
            {!data?.isOutOfStock && (
              <>
                {isInWishlist ? (
                  <FaHeart
                    className="cursor-pointer text-lg text-red-500"
                    onClick={() =>
                      handleToggleWishlist({ productId: data?._id })
                    }
                  />
                ) : (
                  <FaRegHeart
                    className="cursor-pointer text-lg hover:text-gray-400"
                    onClick={() =>
                      handleToggleWishlist({ productId: data?._id })
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
              href={`/${lang}/${data?.category[0]?.name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
            >
              <Image
                src={getImageUrl(BASE_API, data?.gallery[0] || data?.image, `/assets/images/products/item1.png`)}
                alt="item1"
                fill
                objectFit="contain"
                className="p-2"
              />
            </Link>
          )}
          <div
            id="bottom"
            className="flex flex-col justify-center px-4 py-3 gap-4 h-[160px]"
            // href={`/${lang}/${data?.category[0].name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
          >
            {data?.isOutOfStock ? (
              <p className="text-xl font-semibold truncate whitespace-nowrap cursor-not-allowed pb-3">
                {data?.name}
              </p>
            ) : (
              <Link
                href={`/${lang}/${data?.category[0]?.name}/${data?.subcategory[0]?.name}/${data?.name}?id=${data?._id}`}
              >
                <p className="text-xl font-semibold truncate whitespace-nowrap mb-3">
                  {data?.name}
                </p>
              </Link>
            )}
            <div className="flex h-6 flex-col group-hover:flex-row-reverse group-hover:items-center group-hover:justify-between transition ease-in-out duration-150 gap-2">
              <div className="flex gap-2 group-hover:justify-end group-hover:items-end">
                {!data?.isOutOfStock && colorVariants.length > 0 ? (
                  colorVariants?.map((item: any) => {
                    const isSelected = selectedColor === item;
                    return (
                      <div
                        className={`w-7 h-7 rounded-md flex justify-center capitalize items-center ${isSelected ? 'bg-black' : 'bg-white'}  ${isSelected ? 'text-white' : 'text-black'}  p-2`}
                        onClick={() => setSelectedColor(item)}
                      >
                        <p className="">{item}</p>
                      </div>
                    );
                  })
                ) : (
                  <>
                    {/* <div className="w-7 h-7 border border-black rounded-md flex justify-center items-center relative">
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
                    </div> */}
                  </>
                )}
              </div>
              <div className="group-hover:">
                <p className="text-xl font-bold text-brand-blue">
                  $ {data?.prices[0]?.amount}
                </p>
              </div>
            </div>
            {!data?.isOutOfStock && permissions[key]?.View ? (
              <button
                className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150"
                onClick={addToCart}
              >
                Add To Cart
              </button>
            ) : !data?.isOutOfStock ? (
              <button
                className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg "
                onClick={addToCart}
              ></button>
            ) : (
              <button
                className="text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg bg-gray-300 text-gray-500 cursor-not-allowed"
                disabled
              >
                Out of Stock
              </button>
            )}
          </div>
        </div>
      ) : type === 'INVENTORY' ? (
        <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300">
          <div className="flex items-center justify-end absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-10">
            <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" />
            {/* <StarIcon /> */}
          </div>
          <div id="top" className="w-full h-[250px] object-contain relative">
            <Image
              src={`/assets/images/inventory/item2.png`}
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
              <p className="text-2xl font-bold">{'Table Top'}</p>
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <div className="text-lg font-semibold  ">
                  Material: <span className="text-[#3A7BD5]">{'Paper'}</span>
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold  ">
                  Dimensions:{' '}
                  <span className="text-[#3A7BD5]">{'72 x 24'}</span>
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
