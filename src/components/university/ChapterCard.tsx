'use client';

import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import React from 'react';
import { Lock, LockOpen  } from 'lucide-react';

import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface ChapterCardProps {
  chapter: {
    _id: string;
    title: string;
    subtitle?: string;
    canAccess?: boolean;
    progress?: number;
    sections?: any[];
    chapterImage?: string;
  };
  index: number;
  courseId: string;
}

export default function ChapterCard({ chapter, index, courseId }: ChapterCardProps) {
  const router = useRouter();
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;

  const handleClick = () => {
    if (!chapter?.canAccess) {
      toast.error('Please complete previous chapters first');
      return;
    }
    const firstSection = chapter?.sections?.[0];
    if (firstSection?.canAccess && firstSection?._id) {
      router.push(`/valliani-university/courses/${courseId}/chapters/${chapter._id}/${firstSection._id}`);
    } else {
      router.push(`/valliani-university/courses/${courseId}/chapters/${chapter._id}`);
    }
  };

  const sectionCount = chapter?.sections?.length ?? 0;
  const isCompleted = chapter?.progress === 100;

  return (
    <div
      onClick={handleClick}
      className={`
        group relative flex flex-col h-full cursor-pointer
        rounded-2xl border border-neutral-200 bg-white
        transition-all duration-500 ease-out
        hover:-translate-y-2 hover:scale-[1.02]
        hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)]
        ${!chapter?.canAccess ? 'opacity-75 cursor-not-allowed' : ''}
      `}
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition duration-500 bg-gradient-to-br from-brand/10 via-transparent to-black/5 pointer-events-none" />
        
      <div className="relative w-full aspect-[4/3] overflow-hidden rounded-t-2xl bg-neutral-100">
        {chapter?.chapterImage ? (
          <Image
           src={getImageUrl(
                      BASE_API as string,
                      chapter?.chapterImage,
                      '/assets/images/Course2.jpg'
                    )}
            alt={chapter?.title || "-"}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <span className="text-4xl font-bold text-slate-400">Ch {index + 1}</span>
          </div>
        )}
        {!chapter?.canAccess && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-500">
            <Lock className="text-white text-2xl animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-base md:text-lg font-bold text-neutral-900 line-clamp-2 group-hover:text-[#6f4e37] transition-colors duration-300">
            {chapter?.title || '-'}
          </h2>

          {chapter?.canAccess ? (  
          <LockOpen  className="w-4 h-4 text-[#6f4e37] shrink-0" />
          ) : (
            <Lock className="w-4 h-4 text-neutral-400 shrink-0" />
          )}
          
        </div>
        {sectionCount > 0 && (
          <p className="text-sm text-neutral-500">
            {sectionCount} section{sectionCount !== 1 ? 's' : ''}
          </p>
        )}
        <div className="mt-auto flex justify-between items-center">
          {isCompleted && (
            <span className="text-xs font-medium text-[#6f4e37]">Completed</span>
          )}
          {!chapter?.canAccess && <Lock className="text-brand text-xl animate-pulse ml-auto" />}
        </div>
      </div>
    </div>
  );
}



