'use client';

import { useState } from 'react';
import { CheckCircle, ChevronDown, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import LoadingComp from '../common/loading';

// interface CourseChapter {
//   id: number;
//   title: string;
//   subtitle: string;
//   deadline: string;
//   isCompleted: boolean;
//   isLocked: boolean;
//   topics: string[];
// }

// const courseChapters: CourseChapter[] = [
//   {
//     id: 1,
//     title: 'Chapter 1:',
//     subtitle: 'Introduction, Sales, and Customer Service',
//     deadline: '12.08.2024',
//     isCompleted: true,
//     isLocked: false,
//     topics: ['Welcome Phase', 'Sale Phase 1', 'Customer Services'],
//   },
//   {
//     id: 2,
//     title: 'Chapter 2:',
//     subtitle: 'Time Management, Repairs, and Sales Leadership',
//     deadline: '12.08.2024',
//     isCompleted: false,
//     isLocked: true,
//     topics: ['Time Management', 'Repair Basics', 'Leadership Skills'],
//   },
//   {
//     id: 3,
//     title: 'Chapter 3:',
//     subtitle: 'Training, and Sales focus',
//     deadline: '12.08.2024',
//     isCompleted: false,
//     isLocked: true,
//     topics: [
//       'Training Fundamentals',
//       'Sales Techniques',
//       'Performance Metrics',
//     ],
//   },
// ];

interface CourseCurriculumProps {
  onTopicClick?: (topic: string) => void;
  onSectionSelect?: (section: any) => void;
  data: any;
  chapterIsLoading: boolean;
}

export default function CourseCurriculum({
  onTopicClick,
  onSectionSelect,
  data,
  chapterIsLoading
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

  const handleRoute = (sectionId: any, section: any) => {
    if (onSectionSelect) {
      // Modal mode - pass section data to parent
      onSectionSelect(section);
    } else {
      // Page mode - navigate
      router.push(
        `/valliani-university/courses/${params?.chapterId}/${sectionId}`,
      );
    }
  };

  return (
    <div className="mx-auto bg-white rounded-xl shadow-md border border-gray-100">
      
      {chapterIsLoading ? (
            <div className='w-full flex justify-center items-center h-[600px]'>
          <LoadingComp />

        </div>
      ) : (
        <>
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
              <div className="mt-2">
                {chapter?.canAccess ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Lock className="w-4 h-4 text-gray-400" />
                )}
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-md font-bold text-navy-700">
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
              className={`w-4 h-4 text-gray-400 transition-transform ${
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
                    <span className="text-gray-600 hover:text-green-300 text-2xl font-bold cursor-pointer transition-colors duration-300">•</span>
                    <button
                      onClick={(e) => {
                        const enrichedTopic = { ...topic, chapterId: chapter?._id };
                        handleRoute(topic?._id, enrichedTopic);
                      }}
                      className="relative text-gray-600 text-md text-left cursor-pointer
                    hover:text-black
                      transition-colors duration-300
                      before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-0.5
                    before:bg-green-500 before:transition-all before:duration-300
                      hover:before:w-full "
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
        </>
      )} 
    </div>
  );
}
