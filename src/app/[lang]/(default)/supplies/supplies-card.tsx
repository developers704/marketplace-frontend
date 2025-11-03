import Image from 'next/image';
import React from 'react';
import { FaRegHeart } from 'react-icons/fa';

const SuppliesCard = () => {
  return (
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
          //    width={720} // Adjust as needed
          //    height={720} // Adjust as needed
          //    layout="responsive"
          //    className="w-full"
        />
      </div>
      <div id="bottom" className="flex flex-col justify-center px-4 py-3 gap-4">
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
  );
};

export default SuppliesCard;
