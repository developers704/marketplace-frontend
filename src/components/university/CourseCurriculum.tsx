'use client';

import { useState } from 'react';
import { CheckCircle, ChevronDown, Lock, Target } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { FaLock } from 'react-icons/fa';
import LoadingComp from '../common/loading';

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
    // console.log('toggling chapter in section:', chapterId);
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
            className={`flex items-center justify-between p-6 ${
              chapter?.canAccess ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
            }`}
            onClick={() => {
              if (!chapter?.canAccess) {
                toast.error('Please complete previous chapters first');
                return;
              }
              toggleChapter(chapter._id);
            }}
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

          {expandedChapters.includes(chapter._id) && chapter?.canAccess && (
            <div className="px-16 pb-6">
              <ul className="space-y-2">
                {chapter.sections?.map((section: any) => (
                  <li key={section._id} className="flex items-center gap-3 py-1">
                    {section.canAccess ? (
                      <span className="text-gray-600 text-2xl font-bold">•</span>
                    ) : (
                      <FaLock className="text-gray-400 text-sm" />
                    )}
                    <button
                      onClick={() => {
                        if (!section.canAccess) {
                          toast.error('Please complete previous sections first');
                          return;
                        }
                        const enriched = {
                          ...section,
                          chapterId: chapter._id,
                          isQuiz: false
                        };
                        handleRoute(section._id, enriched);
                      }}
                      disabled={!section.canAccess}
                      className={`text-left transition ${
                        section.canAccess
                          ? 'text-gray-700 hover:text-black cursor-pointer'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {section.title}
                      {section.status === 'Completed' && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </button>
                  </li>
                ))}

                {/* Quiz Item - Chapter Level */}
                {chapter.quiz && (
                  <li className="flex items-center gap-3 py-2 mt-2 border-t border-gray-200">
                    <span className="text-gray-600 text-2xl font-bold">•</span>
                    
                    {chapter.progress === 100 || chapter.status === 'Completed' ? (
                      // Unlocked Quiz
                      <button
                        onClick={() => {
                          const quizSection = {
                            _id: chapter.quiz, // quiz ID
                            title: 'Quiz',
                            quiz: true, // flag
                            chapterId: chapter._id,
                            isQuiz: true // important
                          };
                          // handleRoute(chapter.quiz, quizSection);
                          onSectionSelect?.(quizSection);
                        }}
                        className="text-left font-bold text-green-600 hover:text-green-800 flex items-center gap-2"
                      >
                        <Target className="w-5 h-5" />
                        Quiz
                      </button>
                    ) : (
                      // Locked Quiz
                      <div className="flex items-center gap-2 text-gray-500">
                        <Lock className="w-5 h-5" />
                        <span>Quiz (Complete chapter to unlock)</span>
                      </div>
                    )}
                  </li>
                )}
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
