import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';

const CourseCard2 = ({ data }: any) => {
  const router = useRouter();
  // console.log(data, '===>>> course data');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  // console.log(name, '===>>> name');

  return (
    <div
      className="w-[250px] p-3 border-[2px] border-[#CCCCCC] bg-white rounded-xl cursor-pointer hover:border-brand-blue hover:shadow-md"
      onClick={() => {
        if (data?.canAccess) {
          router.push(`/valliani-university/courses/chapters/${data?._id}`);
        } else {
          toast.error('You do not have access to this course yet');
        }
      }}
    >
      <div className="relative rounded-2xl aspect-square">
        <Image
          src={getImageUrl(BASE_API as string, data?.thumbnail, '/assets/images/Course2.jpg')}
          alt={'image'}
          fill
          className="object-cover rounded-2xl"
        />
      </div>
      <div
        id="text"
        className="flex flex-col items-start justify-between gap-3 p-3 w-fit"
      >
        <h2 className="text-xl font-bold text-black text-wrap">{data?.name}</h2>
        {/* <p className="text-[#0081FE] font-bold">
          Approx. {`${'data?.approximateHours'}`} hours
        </p> */}
        
        <h4 className="text-base font-bold text-black text-wrap">Course Duration: {data?.courseDuration} Min</h4>
        <div className="flex items-center justify-between w-full">
          <div className="font-bold text-brand-muted">
            {`${data?.totalVideos}`} videos
          </div>
          {!data?.canAccess && <FaLock className="text-brand-muted" />}
        </div>
      </div>
    </div>
  );
};

export default CourseCard2;
