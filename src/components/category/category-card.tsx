import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import React from 'react';

const CategoryCard = ({ item }: any) => {
  // console.log(item, "===>>> indiviual item")
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  // console.log(`${BASE_API}/uploads/images/${item.image}`);

  return (
    <div className="w-1/7 h-full">
      <div className=" w-1/7  h-full rounded-xl flex flex-col items-center justify-between gap-2 py-6 px-8 ">
        <Image
          // src={`/assets/images/category/lose-stone.png`}
          src={getImageUrl(BASE_API, `/uploads/images/${item.image}`)}
          alt="img"
          objectFit="cover"
          width={150}
          height={150}
          className="h-full object-contain"
        />
        <p className="text-lg font-bold text-center">{item.name}</p>
      </div>
    </div>
  );
};

export default CategoryCard;
