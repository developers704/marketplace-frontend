'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import CourseContent from '@/components/university/CourseContent';
import SectionCard from '@/components/university/SectionCard';
import { useGetCourseChaptersDataQuery, useGetSectionsDataQuery, fetchSectionsData } from '@/framework/basic-rest/university/dashboardApi';
import LoadingComp from '@/components/common/loading';
import { toast } from 'react-toastify';

export default function ChapterSectionPageContent() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const chapterId = params?.chapterId as string;
  const sectionId = params?.sectionId as string;

  const [selectedVideoId, setSelectedVideoId] = useState<string | null>(null);

  const { data: chaptersData, refetch: refetchChapters } = useGetCourseChaptersDataQuery(courseId);
  const {
    data: sectionResponse,
    isLoading: sectionsIsLoading,
    refetch: sectionsRefetch,
  } = useGetSectionsDataQuery(courseId, sectionId);

  const chapters = chaptersData?.data?.chapters ?? [];
  const currentChapter = chapters.find((ch: any) => ch._id === chapterId);
  const sections = currentChapter?.sections ?? [];
  const hasQuiz = !!currentChapter?.quiz;
  const sectionData = sectionResponse?.data ?? sectionResponse;

  const handleBackToChapters = () => {
    router.push(`/valliani-university/courses/${courseId}`);
  };

  const refetchSelectedSection = async () => {
    if (!courseId || !sectionId) return null;
    try {
      const res = await fetchSectionsData(courseId, sectionId);
      if (res?.success === false) {
        toast.error(res?.message || 'Something went wrong');
        return null;
      }
      return res;
    } catch (err: any) {
      toast.error(err?.message || 'Failed to fetch section');
      return null;
    }
  };

  const sectionListForCards = hasQuiz
    ? [
        ...sections.map((s: any) => ({ ...s, isQuiz: false })),
        {
          _id: currentChapter?.quiz?._id ?? currentChapter?.quiz,
          title: 'Quiz',
          canAccess: currentChapter?.progress === 100 || currentChapter?.status === 'Completed',
          isQuiz: true,
        },
      ]
    : sections;

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-110px)] ">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <button
          onClick={handleBackToChapters}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition px-4 py-2 rounded-lg hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Course</span>
        </button>
        <h2 className="text-xl font-bold text-[#6f4e37] truncate max-w-[50%]">
          {currentChapter?.title || 'Chapter'}
        </h2>
        <div />
      </div>

      <div className="flex-1 overflow-auto">
        {/* Section cards at top */}
        <div className="bg-white border-b border-gray-200 px-4 py-6">
          {/* <p className="text-sm font-medium text-neutral-500 mb-4">Sections</p> */}
          <div className="flex flex-wrap gap-3">
            {sectionListForCards.map((sec: any) => {
              const sid = sec?.isQuiz ? (sec?._id?._id ?? sec?._id) : sec?._id;
              if (!sid) return null;
              return (
                <div key={sid} className="min-w-[200px] max-w-[280px]">
                  <SectionCard
                    section={sec}
                    isSelected={sectionId === sid}
                    courseId={courseId}
                    chapterId={chapterId}
                    isQuiz={sec?.isQuiz}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Content area */}
        <div className="p-4">
          {sectionsIsLoading ? (
            <div className="w-full flex justify-center items-center min-h-[400px]">
              <LoadingComp />
            </div>
          ) : sectionData ? (
            <CourseContent
              sectionData={{ ...sectionData, chapterId }}
              selectedVideo={selectedVideoId}
              setSelectedVideo={setSelectedVideoId}
              refetchSectionData={refetchSelectedSection}
              refetchChapters={refetchChapters}
              courseId={courseId}
              sectionsIsLoading={sectionsIsLoading}
              onNavigate={async (payload: any) => {
                const nextId = payload?.isQuiz
                  ? payload?._id?._id ?? payload?._id
                  : payload?._id;
                const nextChapterId = payload?.chapterId;
                if (nextId && nextChapterId) {
                  router.push(`/valliani-university/courses/${courseId}/chapters/${nextChapterId}/${nextId}`);
                } else if (nextId) {
                  router.push(`/valliani-university/courses/${courseId}/chapters/${chapterId}/${nextId}`);
                }
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center min-h-[300px] text-gray-500 p-8">
              <p>Select a section above to view content.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
