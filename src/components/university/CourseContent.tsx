'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, ChevronDown } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import VideoSectionContent from './VideoSectionContent';
import QuizSection from './QuizSection';
import {
  toggleVideoReactions,
  videoProgress,
} from '@/framework/basic-rest/university/dashboardApi';
import { FaCheckCircle, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
import DOMPurify from 'dompurify';
import LoadingComp from '../common/loading';



const IntroductionComp = ({ content }: any) => {
  const safeHTML = DOMPurify.sanitize(content);
  return (
    <>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Introduction
              </h1>

              <div className="space-y-8">
                <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
};
const ObjectiveComp = ({ content }: any) => {
  const safeHTML = DOMPurify.sanitize(content);
  return (
    <>
      <div className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-8">
                Objective
              </h1>

              <div className="space-y-8">
    
                <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default function CourseContent({
  sectionData,
  refetchSectionData,
  refetchChapters,
  courseId: propCourseId,
  sectionsIsLoading
}: any) {
  const params = useParams() as { chapterId: string; sectionId: string };
  // prefer courseId passed from parent (modal), fallback to URL param
  
  const paramCourseId = params?.chapterId;
  const paramSectionId = params?.sectionId;
  const courseId = propCourseId ?? paramCourseId;

  // derive chapterId and sectionId for API calls from sectionData when available
  const derivedChapterId =
    sectionData?.chapterId || sectionData?.chapter?._id || sectionData?.chapter || null;
  const derivedSectionId = sectionData?._id || paramSectionId || null;

  const [expandedSidebarItems, setExpandedSidebarItems] = useState<number[]>([
    2,
  ]);
  const [activeSidebar, setActiveSidebar] = useState<any>(1);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<any>(false);
  // const [videoReaction, setVideoReaction] = useState<any>('');
  const [watchedDuration, setWatchedDuration] = useState<any>(0);
  const router = useRouter();
  // const toggleSidebarItem = (itemId: number) => {
  //   setExpandedSidebarItems((prev) =>
  //     prev.includes(itemId)
  //       ? prev.filter((id) => id !== itemId)
  //       : [...prev, itemId],
  //   );
  //   setActiveSidebar(itemId);
  // };

  // Auto-select the first video when section data loads
  useEffect(() => {
    if (sectionData?.content && sectionData.content.length > 0) {
      setSelectedVideo(sectionData.content[0]._id);
    } else {
      setSelectedVideo(null);
    }
  }, [sectionData?.content]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isQuizStarted) {
        e.preventDefault();
        e.returnValue = ''; 
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isQuizStarted]);

const nextVideoHandler = async () => {
  const videoData = {
    watchedDuration: watchedDuration,
    completed: true,
  };

  if (!courseId || !derivedChapterId || !derivedSectionId) {
    toast.error('Unable to mark video progress: missing identifiers');
    return;
  }

  try {
    const res = await videoProgress(
      courseId,
      derivedChapterId,
      derivedSectionId,
      selectedVideo,
      videoData,
    );

    if (res?.success) {
      
      toast.success(res?.message || 'Progress updated successfully');

      await refetchSectionData?.();
      await refetchChapters?.();

      if (res?.data?.nextContent?.navigationType === 'quiz') {
        setActiveSidebar('quiz');
      } else if (res?.data?.nextContent?.navigationType === 'content') {
        setSelectedVideo(res?.data?.nextContent?.content?._id);
        setActiveSidebar(3);
      }
    } else {

      toast.error(res?.message || 'fix');
    }
  } catch (error:any) {
     const errorMessage = error?.message || 'Failed to fetch section data';
     toast.error(errorMessage || "Something went wrong while updating progress");
  }
};


  const videoReactionHandler = async (reaction: any) => {
    // const reaction = videoReaction
    if (!courseId || !derivedChapterId || !derivedSectionId) {
      toast.error('Unable to send reaction: missing identifiers');
      return;
    }

    const res = await toggleVideoReactions(
      courseId,
      derivedChapterId,
      derivedSectionId,
      selectedVideo,
      reaction,
    );
    return res;
  };
  const quizRouteHandler: any = () => {
    if (
      sectionData?.quiz?.userAttempts.passed ||
      sectionData?.quiz?.canAttempt
    ) {
      setActiveSidebar('quiz');
    } else if (
      sectionData?.quiz?.userAttempts.remainingAttempts === 0 &&
      sectionData?.quiz?.userAttempts.bestGrade === 'F'
      //&& !sectionData?.quiz?.userAttempts.passed
    ) {
      toast.error(
        `Your quiz remaining attempts are 0, please complete the course first`,
      );
      // setActiveSidebar(1);
    } else {
      toast.error(
        'You are not eligible for the quiz, please complete the course first',
      );
    }
  };

    const hasIntroduction = !!sectionData?.introduction;
    const hasObjective = !!sectionData?.objective;
    const hasVideos = sectionData?.content && sectionData.content.length > 0;
    const hasQuiz = !!sectionData?.quiz;

    const hasAnyContent = hasIntroduction || hasObjective || hasVideos || hasQuiz;

  return (
    <div className="flex gap-5 shadow-xl rounded-lg m-4">

      {sectionsIsLoading ? (
        <div className='w-full flex justify-center items-center h-[600px]'>
          <LoadingComp />
        </div>

        ): !hasAnyContent ? (
        <div className="w-full flex flex-col justify-center items-center h-[600px] text-center">
        <h2 className="text-2xl font-semibold text-gray-700 mb-2">
          No content available
        </h2>
        <p className="text-gray-500 max-w-md">
          This chapter does not have any introduction, objective, videos, or quiz yet.
          Please check back later.
        </p>
        </div>
        ) : (
          <div className="overflow-y-auto p-6">
          { sectionData?.introduction && (
        <IntroductionComp content={sectionData?.introduction} />
          )}
        
         { sectionData?.objective && (
         <ObjectiveComp content={sectionData?.objective} />
      )}

        <div className="">
          {sectionData?.content && sectionData.content.length > 0 && (
            <div className="space-y-4 mt-6 pl-6 pr-6">
              <h2 className="text-2xl font-semibold mb-4">Videos</h2>
              {sectionData.content.map((video: any, idx: number) => (
                <div
                  key={video._id || idx}
                  className="p-4 flex items-center justify-between"
                >
                  <div className='flex items-center justify-between gap-2'>
                    <div className="text-sm text-gray-500">{idx + 1}.</div>
                    <div className="text-base font-medium text-gray-800">{video.title}</div>
                    <div className="text-sm text-gray-500">{video.duration ? `${video.duration} sec` : ''}</div>
                  </div>
                  <div>
                    {/* {selectedVideo === video._id ? (
                      <span className="px-3 py-1 bg-gray-200 rounded text-sm">Playing</span>
                    ) : null} */}
                  </div>
                </div>
              ))}
            </div>
          ) 
          }


          {selectedVideo && (
              <div className="">
              <VideoSectionContent
                videoId={selectedVideo}
                content={sectionData?.content}
                setWatchedDuration={setWatchedDuration}
                videoReactionHandler={videoReactionHandler}
                refetchSectionData={refetchSectionData}
              />
              <div className="max-w-4xl mx-auto flex justify-end">
                <button
                  onClick={() => nextVideoHandler()}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Submit
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          )}
        </div>

        {sectionData?.quiz && (
        <div className="mt-2 p-6">
            <QuizSection
              isQuizStarted={isQuizStarted}
              setIsQuizStarted={setIsQuizStarted}
              quizData={sectionData?.quiz}
              setActiveSidebar={setActiveSidebar}
              refetchChapters={refetchChapters}
              refetchSectionData={refetchSectionData}
            />
        </div>
          )}
      </div>
        )}
      
    </div>
  );
}
