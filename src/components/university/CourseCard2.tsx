import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import React from 'react';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { useRouter } from 'next/navigation';

const CourseCard2 = ({ data }: any) => {
  console.log(data, 'courseCard2Data');
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
      className="flex flex-col h-full border-2 border-[#CCCCCC] rounded-xl cursor-pointer hover:border-brand-blue hover:shadow-md transition bg-white"
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative w-full aspect-square rounded-xl overflow-hidden">
        <Image
          src={getImageUrl(
            BASE_API as string,
            data?.thumbnail,
            '/assets/images/Course2.jpg'
          )}
          alt={data?.name}
          fill
          className="object-cover"
        />
      </div>
      {/* Content */}
      <div className="flex flex-col justify-between flex-1 p-3 gap-2">
        <h2 className="text-base md:text-lg font-bold text-black line-clamp-2">
          {data?.name}
        </h2>

        <h4 className="text-sm font-semibold text-gray-700">
          Course Duration: {data?.courseDuration} Min
        </h4>

        <div className="flex items-center justify-between mt-auto">
          <span className="text-sm font-bold text-brand-muted">
            {data?.totalVideos} videos
          </span>
          {!data?.canAccess && <FaLock className="text-brand-muted" />}
        </div>
      </div>
    </div>
  );
};

export default CourseCard2;
