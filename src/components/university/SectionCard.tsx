'use client';

import React from 'react';
import { Lock, CheckCircle2, Play, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';

interface SectionCardProps {
  section: {
    _id: string;
    title: string;
    canAccess?: boolean;
    status?: string;
    content?: any[];
    introduction?: string;
    quiz?: boolean;
    isQuiz?: boolean;
    
  };
  isSelected: boolean;
  courseId: string;
  chapterId: string;
  isQuiz?: boolean;
}

export default function SectionCard({
  section,
  isSelected,
  courseId,
  chapterId,
  isQuiz,
}: SectionCardProps) {

  const router = useRouter();
  const sectionId = section?.isQuiz ? (section?._id ?? section?._id) : section?._id;
  const canAccess = section?.canAccess ?? true;
  const isCompleted = section?.status === 'Completed';

  const handleClick = () => {
    if (!canAccess) {
      toast.error('Please complete previous sections first');
      return;
    }
    router.push(`/valliani-university/courses/${courseId}/chapters/${chapterId}/${sectionId}`);
  };

  const Icon = isQuiz ? FileText : (section?.content?.length ? Play : FileText);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`
        flex items-center gap-4 w-full text-left p-4 rounded-xl border-2 transition-all duration-200
        ${isSelected
          ? 'border-[#6f4e37] bg-[#EDE8D0] shadow-md'
          : canAccess
          ? 'border-[#EDE8D0] bg-white hover:border-[#6f4e37] hover:bg-neutral-50'
          : 'border-[#EDE8D0] bg-neutral-50 opacity-75 cursor-not-allowed'
        }
      `}
    >
      <div
        className={`
          flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center
          ${isSelected ? 'bg-[#6f4e37] text-[#EDE8D0]' : isCompleted ? 'bg-[#EDE8D0] text-[#6f4e37]' : canAccess ? 'bg-neutral-100 text-neutral-600' : 'bg-neutral-200 text-neutral-400'}
        `}
      >
        {isCompleted && !isSelected ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : !canAccess ? (
          <Lock className="w-5 h-5" />
        ) : (
          <Icon className="w-5 h-5" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-semibold text-neutral-900 block truncate">
          {isQuiz ? 'Quiz' : section?.title}
        </span>
        {isCompleted && (
          <span className="text-xs text-[#6f4e37] font-semibold">Completed</span>
        )}
      </div>
    </button>
  );
}
