import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import React from 'react';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const CourseCard2 = ({ data }: any) => {
  const router = useRouter();
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const handleCardClick = () => {
    if (data?.canAccess) {
      router.push(`/valliani-university/courses/${data?._id}`);
    } else {
      toast.error('You do not have access to this course yet');
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="
        group relative flex flex-col h-full cursor-pointer
        rounded-2xl border border-neutral-200 bg-white
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
      "
    >
      
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-brand/10 via-transparent to-black/5 pointer-events-none" />

      {/* Image */}
      <div className="relative w-full aspect-square overflow-hidden rounded-t-2xl">
        <Image
          src={getImageUrl(
            BASE_API as string,
            data?.thumbnail,
            '/assets/images/Course2.jpg'
          )}
          alt={data?.name}
          fill
          className="
            object-cover transition-transform duration-700 ease-out
            group-hover:scale-110
          "
        />

        {/* Lock overlay */}
        {!data?.canAccess && (
          <div className="
            absolute inset-0 flex items-center justify-center
            bg-black/40 backdrop-blur-sm
            opacity-0 group-hover:opacity-100
            transition duration-500
          ">
            <FaLock className="text-white text-2xl animate-pulse" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h2 className="
          text-base md:text-lg font-bold text-neutral-900
          line-clamp-2 group-hover:text-brand
          transition-colors duration-300
        ">
          {data?.name || "-"}
        </h2>

        <p className="text-sm text-neutral-600 font-medium">
          Course Duration: {data?.courseDuration || '-'} Min
        </p>

        <div className="mt-auto flex justify-between items-center">
          <span className="text-xs uppercase tracking-wider text-neutral-400">
            {data?.level || '-'}
          </span>
          {!data?.canAccess && <FaLock className="text-brand text-xl animate-pulse" />}
        </div>
      </div>
    </div>
  );
};

export default CourseCard2;
