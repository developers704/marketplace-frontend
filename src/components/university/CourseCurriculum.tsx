'use client';

import { useState } from 'react';
import { CheckCircle, ChevronDown, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

interface CourseChapter {
  id: number;
  title: string;
  subtitle: string;
  deadline: string;
  isCompleted: boolean;
  isLocked: boolean;
  topics: string[];
}

const courseChapters: CourseChapter[] = [
  {
    id: 1,
    title: 'Chapter 1:',
    subtitle: 'Introduction, Sales, and Customer Service',
    deadline: '12.08.2024',
    isCompleted: true,
    isLocked: false,
    topics: ['Welcome Phase', 'Sale Phase 1', 'Customer Services'],
  },
  {
    id: 2,
    title: 'Chapter 2:',
    subtitle: 'Time Management, Repairs, and Sales Leadership',
    deadline: '12.08.2024',
    isCompleted: false,
    isLocked: true,
    topics: ['Time Management', 'Repair Basics', 'Leadership Skills'],
  },
  {
    id: 3,
    title: 'Chapter 3:',
    subtitle: 'Training, and Sales focus',
    deadline: '12.08.2024',
    isCompleted: false,
    isLocked: true,
    topics: [
      'Training Fundamentals',
      'Sales Techniques',
      'Performance Metrics',
    ],
  },
];

interface CourseCurriculumProps {
  onTopicClick?: (topic: string) => void;
  data: any;
}

export default function CourseCurriculum({
  onTopicClick,
  data,
}: CourseCurriculumProps) {
  const [expandedChapters, setExpandedChapters] = useState<number[]>([1]);
  const router = useRouter();
  const params = useParams();

  // console.log(data, 'data');

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) =>
      prev.includes(chapterId)
        ? prev.filter((id) => id !== chapterId)
        : [...prev, chapterId],
    );
  };

  const handleRoute = (sectionId: any) => {
    router.push(
      `/valliani-university/courses/chapters/${params?.chapterId}/${sectionId}`,
    );
  };

  return (
    <div className="mx-auto bg-white rounded-xl shadow-md border border-gray-100">
      {data?.map((chapter: any, index: number) => (
        <div
          key={chapter._id}
          className="border-b border-gray-100 last:border-b-0"
        >
          <div
            className="flex items-center justify-between p-6 cursor-pointer"
            onClick={() => toggleChapter(chapter._id)}
          >
            <div className="flex items-start gap-4">
              <div className="mt-1">
                {chapter?.canAccess ? (
                  <CheckCircle className="w-6 h-6 text-green-500" />
                ) : (
                  <Lock className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-lg font-bold text-navy-700">
                    Chapter {index + 1}: {chapter.title}
                  </h3>
                  {/* <span className="text-lg text-navy-700">
                    {chapter.subtitle}
                  </span> */}
                </div>
                {chapter?.deadline && (
                  <p className="text-gray-500 mt-1">
                    Deadline {chapter?.deadline.split('T')[0]}
                  </p>
                )}
              </div>
            </div>
            <ChevronDown
              className={`w-6 h-6 text-gray-400 transition-transform ${
                expandedChapters.includes(chapter._id)
                  ? // chapter?.sections?.length > 0
                    'transform rotate-180'
                  : ''
              }`}
            />
          </div>

          {expandedChapters.includes(chapter._id) && (
            <div className="px-16 pb-6">
              <ul className="space-y-2">
                {chapter.sections?.map((topic: any, index: any) => (
                  <li key={index} className="flex items-center gap-2">
                    <span className="text-blue-500 text-2xl font-bold">•</span>
                    <button
                      onClick={(e) => {
                        // e.stopPropagation();
                        // handleTopicClick(topic, chapter.isLocked);
                        handleRoute(topic._id);
                      }}
                      className={`text-blue-500 text-lg hover:text-blue-700 hover:underline text-left ${
                        !chapter.canAccess && !topic?.canAccess
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                      disabled={!chapter.canAccess && !topic?.canAccess}
                    >
                      {topic?.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
