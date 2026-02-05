import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaLock } from 'react-icons/fa';

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
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API || '';
  const router = useRouter();

  const progress =
    data?.userProgress?.progress ??
    data?.progress ??
    0;
  const gradeLabel =
    data?.userProgress?.gradeLabel ??
    data?.gradeLabel ??
    data?.grade ??
    '—';
  const gradePercentage =
    data?.userProgress?.gradePercentage ??
    data?.gradePercentage ??
    0;

  return (
    <div
      onClick={() => {
        if (data?.canAccess) {
          router.push(`/valliani-university/courses/${data?._id}`);
        } else {
          toast.error('You do not have access to this course yet');
        }
      }}
      className="
        group relative cursor-pointer
        rounded-2xl border border-neutral-200 bg-white
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        overflow-hidden max-w-sm
      "
    >
      {/* ✨ Luxury glow */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-brand/10 via-transparent to-black/5 pointer-events-none" />

      {/* Image */}
      <div className="relative aspect-square overflow-hidden rounded-2xl">
        <Image
          src={getImageUrl(
            BASE_API,
            data?.thumbnail || '',
            '/assets/images/Course2.jpg'
          )}
          alt={data?.name || 'course'}
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
      <div className="p-4 flex flex-col gap-3">
        <h3 className="
          text-base font-semibold text-neutral-900
          line-clamp-2 group-hover:text-brand
          transition-colors duration-300
        ">
          {data?.name || '-'}
        </h3>
   {/* Course Details */}
        {/* <div className="flex justify-between items-center mb-4">
          <span className="text-blue-600 font-medium text-xs">
            Approx. {data?.duration}
          </span>
          <span className="text-gray-500 text-sm">
            {data?.totalVideos} Videos
          </span>
        </div> */}
        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex-1 h-2 rounded-full bg-neutral-200 overflow-hidden">
              <div
                className="
                  h-full rounded-full
                  bg-gradient-to-r from-green-400 to-green-600
                  transition-all duration-700 ease-out
                "
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-sm font-medium text-neutral-600">
              {progress}%
            </span>
          </div>
           <div className="mt-auto flex justify-between items-center">
           <span className="text-xs uppercase tracking-wider text-neutral-400">
            {data?.level || '-'}
           </span>
             {!data?.canAccess && <FaLock className="text-brand text-xl animate-pulse" />}
           </div>
        </div>
      </div>
    </div>
  );
}
