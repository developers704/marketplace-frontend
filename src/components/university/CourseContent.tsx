'use client';

import { useEffect, useState } from 'react';
import { ArrowRight,  Play, Clock, CheckCircle2, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import VideoSectionContent from './VideoSectionContent';
import QuizSection from './QuizSection';
import {
  toggleVideoReactions,
  videoProgress,
} from '@/framework/basic-rest/university/dashboardApi';
// import { FaCheckCircle, FaLock } from 'react-icons/fa';
import { toast } from 'react-toastify';
// import DOMPurify from 'dompurify';
// import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser';
// import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';
import TipTapRenderer from './TipTapRenderer';

import LoadingComp from '../common/loading';



const IntroductionComp = ({ content }: any) => {
  if (!content) return null;

 return (
   <>
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <TipTapRenderer content={content} className="introduction-content" />
      </div>
    </div>
     </>
  );
};

const ObjectiveComp = ({ content }: any) => {
  if (!content) return null;

  return (
      <>
    <div className="w-full">
      <div className="max-w-5xl mx-auto">
        <TipTapRenderer content={content} className="objective-content" />
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
  sectionsIsLoading,
  onNavigate, // optional: parent can load another section/quiz into the right panel

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

  const isQuizPage = sectionData?.isQuiz === true;
    const hasIntroduction = !isQuizPage && !!sectionData?.introduction;
    const hasObjective = !isQuizPage && !!sectionData?.objective;
    const hasVideos = !isQuizPage && sectionData?.content?.length > 0;
    const hasQuiz = isQuizPage && sectionData?.quiz;

    const hasAnyContent = hasIntroduction || hasObjective || hasVideos || hasQuiz;

  // Initialize/keep selected video when content changes (avoid resetting to first video on every refetch)
  useEffect(() => {
    if (isQuizPage) {
      setSelectedVideo(null);
      return;
    }

    const contentList = sectionData?.content || [];
    if (!Array.isArray(contentList) || contentList.length === 0) {
      setSelectedVideo(null);
      return;
    }

    // Keep current selection if it still exists
    const stillExists = selectedVideo
      ? contentList.some((v: any) => v?._id === selectedVideo)
      : false;

    if (stillExists) return;

    setSelectedVideo(contentList[0]?._id);
  }, [sectionData?.content, isQuizPage, selectedVideo]);
 
  // Prevent page leave during quiz
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


  // Reset watchedDuration when switching videos
  useEffect(() => {
    setWatchedDuration(0);
  }, [selectedVideo]);

  const navigateToSectionOrQuiz = async (payload: any) => {
    if (typeof onNavigate === 'function') {
      return await onNavigate(payload);
    }

    // Fallback (page-mode): navigate to section/quiz route
    const nextId =
      payload?.isQuiz
        ? payload?._id?._id ?? payload?._id
        : payload?._id;

    if (!courseId || !nextId) return null;

    // NOTE: In this repo, `courses/chapters/[chapterId]/[sectionId]` uses `chapterId` as courseId
    router.push(`/valliani-university/courses/chapters/${courseId}/${nextId}`);
    return null;
  };



const nextVideoHandler = async () => {
  if (isQuizPage) return;
  if (!selectedVideo) return;
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

      const next = res?.data?.nextContent;

      // Always refetch chapters (unlock next chapter/section + update sidebar)
      await refetchChapters?.();

      if (next?.navigationType === 'quiz') {
        // Auto-open quiz after finishing all videos/content
        await navigateToSectionOrQuiz({
          _id: next?.quizId,
          isQuiz: true,
          chapterId: next?.chapterId
        });
        return;
      }

      if (next?.navigationType === 'content') {
        const nextVideoId = next?.contentId || next?.content?._id;
        const nextSectionId = next?.sectionId;

        // Same section → just switch video
        if (
          nextSectionId &&
          derivedSectionId &&
          nextSectionId.toString() === derivedSectionId.toString()
        ) {
          if (nextVideoId) setSelectedVideo(nextVideoId);
          await refetchSectionData?.(); // update per-video status in list
          return;
        }

        // Different section → ask parent to load it
        if (nextSectionId) {
          await navigateToSectionOrQuiz({
            _id: nextSectionId,
            isQuiz: false,
            chapterId: next?.chapterId
          });
          if (nextVideoId) setSelectedVideo(nextVideoId);
          return;
        }
      }

      if (next?.navigationType === 'complete') {
        toast.success('Course completed!');
        await refetchSectionData?.();
        return;
      }

      // Default: refresh section data
      await refetchSectionData?.();
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
  
    
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {sectionsIsLoading ? (
        <div className="w-full flex justify-center items-center h-[600px]">
          <LoadingComp />
        </div>
      ) : !hasAnyContent ? (
        <div className="w-full flex flex-col justify-center items-center h-[600px] text-center px-4">
          <div className="bg-white rounded-2xl shadow-xl p-12 max-w-md">
            <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <Lock className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              No Content Available
            </h2>
            <p className="text-gray-600 text-lg leading-relaxed">
              This section does not have any content yet. Please check back later.
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Introduction Section - Luxurious Design */}
          {!isQuizPage && hasIntroduction && (
            <div className="mb-12">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="w-1 h-8 bg-white rounded-full"></div>
                    Introduction
                  </h2>
                </div>
                <div className="p-8 md:p-12">
                  <IntroductionComp content={sectionData?.introduction} />
                </div>
              </div>
            </div>
          )}

          {/* Video Content Section - Professional Design */}
          {!isQuizPage && hasVideos && (
            <div className="mb-12">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Play className="w-8 h-8" />
                    Course Videos
                  </h2>
                </div>
                <div className="p-8">
                  {/* Video List - Enhanced Design */}
                  <div className="space-y-4 mb-8">
                    {sectionData.content.map((video: any, idx: number) => {
                      const isSelected = selectedVideo === video._id;
                      const isCompleted = video?.status === 'Completed';
                      const isLocked = idx > 0 && sectionData.content?.[idx - 1]?.status !== 'Completed';
                      const canOpen = idx === 0 || !isLocked;

                      return (
                        <button
                          type="button"
                          key={video._id}
                          onClick={() => {
                            if (!canOpen) {
                              toast.error('Please complete the previous video first');
                              return;
                            }
                            setSelectedVideo(video._id);
                          }}
                          className={`w-full text-left p-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] ${
                            isSelected
                              ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg'
                              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent hover:border-gray-300 shadow-md hover:shadow-lg'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6 flex-1">
                              <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                                isSelected 
                                  ? 'bg-blue-600 text-white' 
                                  : isCompleted
                                  ? 'bg-green-500 text-white'
                                  : 'bg-gray-300 text-gray-600'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                  idx + 1
                                )}
                              </div>
                              <div className="flex-1">
                                <h3 className={`text-lg font-semibold mb-2 ${
                                  isSelected ? 'text-blue-900' : 'text-gray-800'
                                }`}>
                                  {video.title}
                                </h3>
                                {video.duration && (
                                  <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Clock className="w-4 h-4" />
                                    <span>
                                      {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} min
                                    </span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {isCompleted && (
                                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Completed
                                </div>
                              )}
                              {isLocked && (
                                <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-full text-sm font-medium flex items-center gap-2">
                                  <Lock className="w-4 h-4" />
                                  Locked
                                </div>
                              )}
                              {isSelected && (
                                <div className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
                                  Playing
                                </div>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Video Player - Enhanced */}
                  {selectedVideo && (
                    <div className="mt-8">
                      <div className="p-2 rounded-xl overflow-hidden shadow-2xl">
                        <VideoSectionContent
                          videoId={selectedVideo}
                          content={sectionData.content}
                          setWatchedDuration={setWatchedDuration}
                          videoReactionHandler={videoReactionHandler}
                          refetchSectionData={refetchSectionData}
                        />
                      </div>
                      <div className="flex justify-end mt-6">
                        <button
                          type="button"
                          onClick={nextVideoHandler}
                          className="group flex items-center gap-3 px-5 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                        >
                          <span>Continue to Next</span>
                          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Quiz Section - Luxurious Design */}
          {hasQuiz && (
            <div className={`${isQuizPage ? '' : 'mt-12'}`}>
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                {isQuizPage && (
                  <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12 text-center">
                    <h1 className="text-5xl font-bold text-white mb-4">
                      Chapter Quiz
                    </h1>
                    <p className="text-xl text-purple-100">
                      Test your knowledge to complete this chapter
                    </p>
                  </div>
                )}
                <div className={`p-8 ${isQuizPage ? '' : 'border-t border-gray-200'}`}>
                  <QuizSection
                    isQuizStarted={isQuizStarted}
                    setIsQuizStarted={setIsQuizStarted}
                    quizData={sectionData.quiz}
                    refetchChapters={refetchChapters}
                    refetchSectionData={refetchSectionData}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
