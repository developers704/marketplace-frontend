import Image from 'next/image';
import React from 'react';

const OrderDetailCard = ({ data }: any) => {
  return (
    <div className="flex-[2] ">
      <div className="flex items-center gap-3 ">
        <div className="flex-1">
          <Image
            src={`/assets/images/products/item1.png`}
            alt="item"
            width={180}
            height={150}
            objectFit="cover"
            className="shadow-md"
          />
        </div>
        <div className="flex-[2] flex flex-col gap-3">
          <div className="text-[12px] text-[#993D20] bg-[#FFEEE8] rounded py-1 px-2 w-fit">
            Category
          </div>
          <div className="text-lg font-semibold">Product Name</div>
          <div>$ Price</div>
        </div>
        <div className="flex-1">
          <div className="text-end">X Quantity</div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailCard;
