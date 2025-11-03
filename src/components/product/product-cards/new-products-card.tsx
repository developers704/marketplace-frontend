import StarIcon from '@/components/icons/star-icon';
import Image from 'next/image';
import React from 'react';
import { FaRegHeart } from 'react-icons/fa';

const NewProductCard = () => {
  return (
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
          width={1920} // Adjust as needed
          height={1080} // Adjust as needed
          layout="responsive"
          className="w-full"
        />
      </div>
      <div id="bottom" className="flex flex-col justify-center px-4 py-3 gap-4">
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
  );
};

export default NewProductCard;
