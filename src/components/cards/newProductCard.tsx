'use client';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

export const ColorFilterComp = ({ colorVariants }: any) => {
  // const [colorVariants, setColorVariants] = useState<any>([]);
  const [selectedColor, setSelectedColor] = useState<any>('W');

  return (
    <>
      {colorVariants.length > 0 ? (
        colorVariants?.map((item: any) => {
          const isSelected = selectedColor === item;
          return (
            <div
              className={`w-7 h-7 rounded-md flex justify-center capitalize border-[2px] items-center ${isSelected ? 'bg-black' : 'bg-white'}  ${isSelected ? 'text-white' : 'text-black'}  p-2 cursor-pointer`}
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
    </>
  );
};

const NewProductCard = ({
  data,
  lang,
  setUpdateList,
  updateList,
  isInWishlist,
  wishlist,
  setWishlist,
}: any) => {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  // console.log(data, 'new product');
  const [colorVariants, setColorVariants] = useState<any>([]);

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

  return (
    <div className="cursor-pointer group relative w-full flex flex-col py-4 transition ease-in-out duration-150 hover:shadow-md hover:shadow-neutral-300 rounded-lg border-[0.5px] border-gray-300 ">
      <div className="flex items-center justify-between absolute w-full rounded-lg bg-white top-0 py-2 px-4 z-30">
        <p className="text-lg font-semibold">New</p>
        {/* <FaRegHeart className="cursor-pointer text-lg hover:text-gray-400" /> */}
        {/* <StarIcon /> */}
      </div>
      <div
        // href={`/${lang}/specialProducts/${data._id}`}
        id="top"
        className="w-full relative h-[200px]"
      >
        <Image
          src={getImageUrl(
            BASE_API as string,
            data?.image || data?.gallery?.[0],
            `/assets/images/products/imageNotAvailable.webp`,
          )}
          alt="item1"
          // width={400} // Adjust as needed
          // height={400} // Adjust as needed
          // layout="responsive"
          fill
          className="w-full object-contain"
        />
      </div>
      <div
        // href={`/${lang}/specialProducts/${data._id}`}
        id="bottom"
        className="flex flex-col justify-center px-4 py-3 gap-4"
      >
        <div>
          <p className="text-2xl font-bold whitespace-nowrap truncate">
            {data?.name}
          </p>
        </div>
        <div className="flex h-6 flex-col group-hover:flex-row-reverse group-hover:items-center group-hover:justify-between transition ease-in-out duration-150 gap-2">
          <div className="flex gap-2 group-hover:justify-end group-hover:items-end">
            {!data?.specialCategory && (
              <ColorFilterComp colorVariants={colorVariants} />
            )}
          </div>
          {/* {!data?.specialCategory && (
            <div className="flex gap-2 ">
              <div className="w-7 h-7 rounded-md flex justify-center capitalize items-center bg-black text-white p-2">
                <p className="">W</p>
              </div>
              <div className="w-7 h-7 rounded-md flex justify-center capitalize items-center bg-black text-white p-2">
                <p className="">Y</p>
              </div>
              <div className="w-7 h-7 rounded-md flex justify-center capitalize items-center bg-black text-white p-2">
                <p className="">R</p>
              </div>
            </div>
          )} */}
          <div>
            <p className="text-xl font-bold text-brand-blue">
              $ {data?.prices[0]?.amount}
            </p>
          </div>
        </div>
        <button className="invisible group-hover:visible text-start w-fit py-3 px-4 text-lg font-semibold rounded-lg hover:bg-black hover:text-white border-black border-[1px] transition ease-in-out duration-150">
          View Product
        </button>
      </div>
    </div>
  );
};

export default NewProductCard;
