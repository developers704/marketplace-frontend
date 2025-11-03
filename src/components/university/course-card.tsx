import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface CourseCardProps {
  _id: string;
  name: string;
  duration: string;
  totalVideos: number;
  userProgress?: any | null;
  thumbnail?: string;
  imageAlt?: string;
}
interface CourseCardDataProps {
  data: CourseCardProps;
}

export default function CourseCard({ data }: any) {
  // console.log(data, 'courseCardData');
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  const router = useRouter();
  return (
    <div
      // href={`/valliani-university/courses/chapters/${data?._id}`}
      onClick={() => {
        if (data?.canAccess) {
          router.push(`/valliani-university/courses/chapters/${data?._id}`);
        } else {
          toast.error('You do not have access to this course yet');
        }
      }}
      className="bg-white w-fix rounded-2xl shadow-sm border p-2 border-gray-200 overflow-hidden max-w-sm"
    >
      {/* Course Image */}
      <div className="relative rounded-2xl aspect-square">
        <Image
          src={getImageUrl(BASE_API, data?.thumbnail, '/assets/images/Course2.jpg')}
          alt={'image'}
          fill
          className="object-cover rounded-2xl"
        />
      </div>

      {/* Course Content */}
      <div className="p-4">
        {/* Course Title */}
        <h3 className="text-base font-semibold text-gray-900 mb-3">
          {data?.name}
        </h3>

        {/* Course Details */}
        <div className="flex justify-between items-center mb-4">
          {/* <span className="text-blue-600 font-medium text-xs">
            Approx. {data?.duration}
          </span> */}
          <span className="text-gray-500 text-sm">
            {data?.totalVideos} Videos
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <div className="w-full bg-gray-200 rounded-full h-2 mr-3">
              <div
                className="bg-green-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${data?.userProgress ? data?.userProgress?.progress : 0}%`,
                }}
              ></div>
            </div>
            <span className="text-sm font-medium text-gray-600 min-w-fit">
              {data?.userProgress === null ? (
                <>{0}%</>
              ) : (
                <>{data?.userProgress?.progress}%</>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
