'use client';

import { useEffect, useState } from 'react';
import { ArrowRight,  Play, Clock, CheckCircle2, Lock } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import VideoSectionContent from './VideoSectionContent';
import QuizSection from './QuizSection';
import {
  toggleVideoReactions,
  videoProgress,
  fetchCustomerCourses,
  fetchCourseChapters,
  manualCompleteSection,
  fetchShortCoursesData,
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
      <div >
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
  onNavigate, 
  selectedVideo,
  setSelectedVideo
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
  // const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<any>(false);
  // const [videoReaction, setVideoReaction] = useState<any>('');
  const [watchedDuration, setWatchedDuration] = useState<any>(0);
  const [timerCompleted, setTimerCompleted] = useState<boolean>(false);
  const [timerRemaining, setTimerRemaining] = useState<number>(0);
  const router = useRouter();

  // ✅ Helper function to get timer completion key for localStorage
  const getTimerCompletionKey = (courseId: string, sectionId: string) => {
    return `course_timer_completed_${courseId}_${sectionId}`;
  };

  // ✅ Helper function to check if timer is already completed
  const isTimerAlreadyCompleted = (courseId: string, sectionId: string): boolean => {
    if (typeof window === 'undefined') return false;
    const key = getTimerCompletionKey(courseId, sectionId);
    const completed = localStorage.getItem(key);
    return completed === 'true';
  };

  // ✅ Helper function to save timer completion status
  const saveTimerCompletion = (courseId: string, sectionId: string) => {
    if (typeof window === 'undefined') return;
    const key = getTimerCompletionKey(courseId, sectionId);
    localStorage.setItem(key, 'true');
    // Also save timestamp for future reference
    localStorage.setItem(`${key}_timestamp`, new Date().toISOString());
  };

    const isQuizPage = sectionData?.isQuiz === true;
    const hasIntroduction = !isQuizPage && !!sectionData?.introduction;
    const hasObjective = !isQuizPage && !!sectionData?.objective;
    const hasVideos = !isQuizPage && sectionData?.content?.length > 0;
    const hasQuiz = isQuizPage && sectionData?.quiz;
    // ✅ MANUAL SECTION: Section with NO content (videos/text) and NO quiz requires manual completion
    // Introduction/objective alone don't count as "content" - they're just informational
    const isManualSection = !isQuizPage && !hasVideos && !hasQuiz && !sectionData?.quiz;
    // Check if section has only introduction (for display purposes)
    const hasOnlyIntroduction = hasIntroduction && !hasVideos && !hasQuiz && !sectionData?.quiz;
    // Check if timer is required (applies if section has requiredTime, even without videos)
    const requiredTime = sectionData?.requiredTime || null;
    console.log('requiredTime:', requiredTime);
    // ✅ FIX: Timer should work even if only introduction exists (no videos)
    const hasTimer = requiredTime !== null && requiredTime > 0;
    // Videos should be shown only if timer is completed or not required
    const shouldShowVideos = !hasTimer || timerCompleted;

    const hasAnyContent = hasIntroduction || hasObjective || hasVideos || hasQuiz || isManualSection;

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

  // Timer logic for section required time
  useEffect(() => {
    if (!hasTimer) {
      setTimerCompleted(true);
      setTimerRemaining(0);
      return;
    }

    // ✅ CRITICAL FIX: Check if timer is already completed for this section
    if (courseId && derivedSectionId) {
      const alreadyCompleted = isTimerAlreadyCompleted(courseId, derivedSectionId);
      if (alreadyCompleted) {
        setTimerCompleted(true);
        setTimerRemaining(0);
        return;
      }
    }

    // Reset timer when section changes (only if not already completed)
    setTimerCompleted(false);
    setTimerRemaining(requiredTime || 0);

    const interval = setInterval(() => {
      setTimerRemaining((prev) => {
        if (prev <= 1) {
          setTimerCompleted(true);
          // ✅ CRITICAL FIX: Save completion status to localStorage
          if (courseId && derivedSectionId) {
            saveTimerCompletion(courseId, derivedSectionId);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [derivedSectionId, requiredTime, hasTimer, courseId]);

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

  // Helper function to navigate to next content (quiz → next chapter → next course)
  const navigateToNextContent = async () => {
    try {
      // First check if there's a quiz in the current chapter
      if (refetchChapters) {
        await refetchChapters();
      }

      if (!courseId || !derivedChapterId) {
        toast.error('Course or Chapter ID not found');
        return;
      }

      const chaptersResponse = await fetchCourseChapters(courseId);
      const chapters = chaptersResponse?.data?.chapters || [];
      const currentChapter = chapters.find((ch: any) => ch._id === derivedChapterId);

      // Check if current chapter has a quiz
      if (currentChapter?.quiz?._id) {
        // Navigate to quiz
        await navigateToSectionOrQuiz({
          _id: currentChapter.quiz._id,
          isQuiz: true,
          chapterId: derivedChapterId
        });
        toast.success('Moving to quiz...');
        return;
      }

      // No quiz, check for next chapter
      const currentChapterIndex = chapters.findIndex(
        (ch: any) => ch._id === derivedChapterId
      );

      if (currentChapterIndex < chapters.length - 1) {
        const nextChapter = chapters[currentChapterIndex + 1];
        const nextSection = nextChapter?.sections?.[0];
        if (nextSection) {
          await navigateToSectionOrQuiz(nextSection);
          toast.success('Moving to next chapter...');
          return;
        }
      }

      // No next chapter, check for next course
      // ✅ CRITICAL FIX: Check if current course is Short Course, then navigate to next short course
      // First, try to get short courses to check if current course is a short course
      try {
        const shortCoursesResponse = await fetchShortCoursesData();
        const shortCourses = shortCoursesResponse?.data?.shortCourses || [];
        const currentShortCourseIndex = shortCourses.findIndex(
          (sc: any) => sc._id === courseId
        );

        // If current course is found in short courses, it's a short course
        if (currentShortCourseIndex !== -1) {
          // ✅ Navigate to next Short Course
          if (currentShortCourseIndex < shortCourses.length - 1) {
            const nextShortCourse = shortCourses[currentShortCourseIndex + 1];
            
            // Check if next short course is accessible
            if (nextShortCourse?.canAccess) {
              const nextCourseId = nextShortCourse._id;
              const nextCourseChapters = await fetchCourseChapters(nextCourseId);
              const nextChapters = nextCourseChapters?.data?.chapters || [];

              if (nextChapters.length > 0) {
                const firstChapter = nextChapters[0];
                const firstSection = firstChapter?.sections?.[0];
                if (firstSection) {
                  router.push(
                    `/valliani-university/courses/${nextCourseId}?chapter=${firstChapter._id}&section=${firstSection._id}`
                  );
                  toast.success('Moving to next short course...');
                  return;
                }
              }
            } else {
              toast.info(`Next short course "${nextShortCourse?.name}" is locked. ${nextShortCourse?.lockReason || 'Complete previous course first.'}`);
              return;
            }
          } else {
            toast.info('All short courses completed!');
            return;
          }
        }
      } catch (shortCourseError) {
        // If short courses API fails, continue with main course logic
        console.log('Short courses check failed, trying main courses:', shortCourseError);
      }

      // ✅ CRITICAL FIX: Check for next course (can be main course OR short course)
      // Now fetchCustomerCourses includes both Course and Short Course types
      const customerCoursesResponse = await fetchCustomerCourses();
      const allCourses = customerCoursesResponse?.data || [];
      
      // Filter courses by type to handle navigation correctly
      // If current course is short course, only check short courses
      // If current course is main course, only check main courses
      const currentCourse = allCourses.find((course: any) => course._id === courseId);
      const currentCourseType = currentCourse?.courseType || 'Course';
      
      // Filter courses by same type (main courses with main courses, short courses with short courses)
      const sameTypeCourses = allCourses.filter(
        (course: any) => course.courseType === currentCourseType
      );
      
      const currentCourseIndex = sameTypeCourses.findIndex(
        (course: any) => course._id === courseId
      );

      if (currentCourseIndex < sameTypeCourses.length - 1) {
        const nextCourse = sameTypeCourses[currentCourseIndex + 1];
        const nextCourseId = nextCourse._id;
        const nextCourseChapters = await fetchCourseChapters(nextCourseId);
        const nextChapters = nextCourseChapters?.data?.chapters || [];

        if (nextChapters.length > 0) {
          const firstChapter = nextChapters[0];
          const firstSection = firstChapter?.sections?.[0];
          if (firstSection) {
            router.push(
              `/valliani-university/courses/${nextCourseId}?chapter=${firstChapter._id}&section=${firstSection._id}`
            );
            toast.success(
              currentCourseType === 'Short Course' 
                ? 'Moving to next short course...' 
                : 'Moving to next course...'
            );
            return;
          }
        }
      }

      toast.info('No further content available.');
    } catch (error: any) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate');
    }
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
      
      // Refetch section data to get updated video statuses
      const updatedSectionResponse = await refetchSectionData?.();
      const updatedSection = updatedSectionResponse?.data || updatedSectionResponse || sectionData;
      const currentSectionVideos = updatedSection?.content || sectionData?.content || [];

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

      // ✅ CRITICAL FIX: Handle navigation to empty section (manual section)
      // This allows routing from content section to empty section (with introduction)
      if (next?.navigationType === 'section' || next?.navigationType === 'manual-section') {
        const nextSectionId = next?.sectionId;
        if (nextSectionId) {
          // Navigate to the empty section (will show introduction and manual completion button)
          await navigateToSectionOrQuiz({
            _id: nextSectionId,
            isQuiz: false,
            chapterId: next?.chapterId
          });
          return;
        }
      }

      if (next?.navigationType === 'complete') {
        toast.success('Course completed!');
        // Automatically navigate to next course/chapter if available
        await navigateToNextContent();
        return;
      }

      // If no next content is returned, check if all videos in current section are completed
      if (!next) {
        const allVideosCompleted = currentSectionVideos.length > 0 && 
          currentSectionVideos.every((video: any) => video.status === 'Completed');
        
        if (allVideosCompleted) {
          // All videos in section completed, navigate to next content (quiz → next chapter → next course)
          await navigateToNextContent();
          return;
        }
      }

      // Default: just refresh (video completed but more videos remain in section)
      return;
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

  // ✅ Manual section completion handler
  const handleManualCompleteSection = async () => {
    if (!courseId || !derivedChapterId || !derivedSectionId) {
      toast.error('Unable to complete section: missing identifiers');
      return;
    }

    try {
      const res = await manualCompleteSection(
        courseId,
        derivedChapterId,
        derivedSectionId,
      );

      if (res?.success) {
        toast.success(res?.message || 'Section marked as completed successfully');

        // Refetch chapters to update unlock status
        await refetchChapters?.();
        
        // Refetch section data to get updated status
        await refetchSectionData?.();

        // Navigate to next content if available
        const next = res?.data?.nextContent;
        if (next) {
          if (next.navigationType === 'quiz') {
            await navigateToSectionOrQuiz({
              _id: next?.quizId,
              isQuiz: true,
              chapterId: next?.chapterId
            });
          } else if (next.navigationType === 'content') {
            await navigateToSectionOrQuiz({
              _id: next?.sectionId,
              isQuiz: false,
              chapterId: next?.chapterId
            });
          } else if (next.navigationType === 'section' || next.navigationType === 'manual-section') {
            // ✅ CRITICAL FIX: Next section is empty (requires manual completion) - navigate to it
            await navigateToSectionOrQuiz({
              _id: next?.sectionId,
              isQuiz: false,
              chapterId: next?.chapterId
            });
          } else if (next.navigationType === 'complete') {
            toast.success('Course completed!');
            await navigateToNextContent();
          }
        } else {
          // No next content, try to navigate to next chapter/course
          await navigateToNextContent();
        }
      } else {
        toast.error(res?.message || 'Failed to complete section');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to complete section';
      toast.error(errorMessage);
    }
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
        <div className=" px-2 sm:px-2 lg:px-2 py-2  ">
          {/* Introduction Section - Luxurious Design */}
          {!isQuizPage && hasIntroduction && (
            <div className="mb-12">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-[#6f4e37] px-8 py-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <div className="w-1 h-8 bg-white rounded-full"></div>
                    {sectionData?.title || '-'}
                  </h2>
                </div>
                <div className="p-4 md:p-8">
                  <IntroductionComp content={sectionData?.introduction} />
                </div>
                
                {/* Timer display if timer is active */}
         {hasTimer && !timerCompleted && (
          <div className="px-6 pb-8">
            <div className="max-w-xl mx-auto bg-gradient-to-br  rounded-2xl p-6 shadow-md">
              
            
              <div className="flex items-center justify-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-yellow-600 animate-pulse" />
                <h3 className="text-lg sm:text-xl font-semibold text-yellow-800">
                  locked
                </h3>
              </div>

              
              <p className="text-center text-yellow-700 mb-4 text-sm sm:text-base">
                Please review the course content in full before proceeding Next.
              </p>
            </div>
          </div>
        )}
                {/* ✅ FIX: Show button only if timer is completed (if timer exists) or no timer */}
                {isManualSection && (!hasTimer || timerCompleted) && (
                  <div className="px-6 pb-6 flex justify-end">
                   
                      <button
                        type="button"
                        onClick={handleManualCompleteSection}
                        className="group flex items-center justify-center gap-3 px-6 py-4 bg-[#EDE8D0] text-[#6f4e37] rounded-xl hover:from-[#EDE8D0]  transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <span>Go to Next</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>                 
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Video Content Section - Professional Design */}
          {!isQuizPage && hasVideos && shouldShowVideos && (
            <div className="mb-12">
              <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
                <div className="bg-[#6f4e37] px-8 py-6">
                  <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Play className="w-8 h-8" />
                   {sectionData?.title  || '-'}
                  </h2>
                </div>
                <div className="p-8">
                  {/* Video List - Professional Horizontal Layout */}
                  <div className="flex flex-wrap gap-4 mb-8">
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
                          className={`flex-1 min-w-[160px]   sm:max-w-[160px] text-left p-2 rounded-xl transition-all duration-300 transform hover:scale-[1.03] hover:shadow-2xl relative overflow-hidden group ${
                            isSelected
                              ? 'bg-gradient-to-br from-[#EDE8D0] to-[#EDE8D0] border-2 border-[#EDE8D0] shadow-xl ring-4 ring-[#EDE8D0]'
                              : isLocked
                              ? 'bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-300 shadow-md opacity-75 cursor-not-allowed'
                              : 'bg-gradient-to-br from-white to-gray-50 border-2 border-transparent hover:border-[#EDE8D0] shadow-lg hover:shadow-xl'
                          }`}
                        >
                         
                          <div className={`absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${
                            isSelected ? 'from-[#EDE8D0] to-[#EDE8D0]' : 'from-blue-400 to-indigo-400'
                          }`}></div>
                          
                          <div className="relative z-10 flex flex-col h-full">
                    
                            {/* <div className="flex items-start justify-between mb-4">
                              <div className={`flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xl shadow-lg transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white ring-4 ring-blue-200' 
                                  : isCompleted
                                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 text-white'
                                  : isLocked
                                  ? 'bg-gradient-to-br from-gray-300 to-gray-400 text-gray-600'
                                  : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700 group-hover:from-blue-100 group-hover:to-indigo-100'
                              }`}>
                                {isCompleted ? (
                                  <CheckCircle2 className="w-6 h-6" />
                                ) : (
                                  <span className="text-lg font-extrabold">{idx + 1}</span>
                                )}
                              </div>
                  
                              <div className="flex flex-col items-end gap-2 ">
                                {isSelected && (
                                  <div className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full text-xs font-bold shadow-md flex items-center gap-1.5 animate-pulse">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                    Playing
                                  </div>
                                )}
                                {isCompleted && !isSelected && (
                                  <div className="px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5">
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    Done
                                  </div>
                                )}
                                {isLocked && (
                                  <div className="px-3 py-1.5 bg-gray-300 text-gray-700 rounded-full text-xs font-semibold shadow-md flex items-center gap-1.5">
                                    <Lock className="w-3.5 h-3.5" />
                                    Locked
                                  </div>
                                )}
                              </div>
                            </div> */}

                         
                            <div className="flex-1 mb-1">
                              <h3 className={`text-base font-bold leading-tight line-clamp-2 ${
                                isSelected 
                                  ? 'text-[#6f4e37]' 
                                  : isLocked
                                  ? 'text-gray-500'
                                  : 'text-[#6f4e37] group-hover:text-[#6f4e37]'
                              }`}>
                                {video?.title || "-"}
                              </h3>
                            </div>

                    
                            <div className="flex items-center justify-between pt-2 border-t border-[#d8b8a0] ">
                              {video?.duration && (
                                <div className={`flex items-center gap-2 text-sm font-medium ${
                                  isSelected ? 'text-[#6f4e37]' : 'text-gray-600'
                                }`}>
                                  <Clock className={`w-4 h-4 ${isSelected ? 'text-[#6f4e37]' : 'text-[#6f4e37]'}`} />
                                  <span>
                                    {Math.floor(video?.duration / 60)}:{(video?.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                </div>
                              )}
                              <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                                isSelected 
                                  ? 'bg-[#6f4e37] animate-pulse' 
                                  : isCompleted
                                  ? 'bg-[#6f4e37]'
                                  : 'bg-gray-300'
                              }`}></div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

      
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
                
                      {(!hasTimer || timerCompleted) && (
                        <div className="flex justify-end mt-6">
                          <button
                            type="button"
                            onClick={nextVideoHandler}
                            className="group flex items-center gap-3 px-5 py-4 bg-[#EDE8D0] text-[#6f4e37] rounded-xl  transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            <span>Continue to Next</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show navigation button when all videos are completed and no video is selected */}
                  {!selectedVideo && sectionData?.content?.length > 0 && 
                   sectionData.content.every((video: any) => video.status === 'Completed') && (
                    <div className="mt-8 flex justify-center">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            // Navigate to next chapter or course
                            if (refetchChapters) {
                              await refetchChapters();
                            }

                            if (!courseId) {
                              toast.error('Course ID not found');
                              return;
                            }

                            const chaptersResponse = await fetchCourseChapters(courseId);
                            const chapters = chaptersResponse?.data?.chapters || [];
                            const currentChapterIndex = chapters.findIndex(
                              (ch: any) => ch._id === derivedChapterId
                            );

                            if (currentChapterIndex < chapters.length - 1) {
                              const nextChapter = chapters[currentChapterIndex + 1];
                              const nextSection = nextChapter?.sections?.[0];
                              if (nextSection) {
                                await navigateToSectionOrQuiz(nextSection);
                                return;
                              }
                            }

                            // Check for next course
                            const customerCoursesResponse = await fetchCustomerCourses();
                            const allCourses = customerCoursesResponse?.data || [];
                            const currentCourseIndex = allCourses.findIndex(
                              (course: any) => course._id === courseId
                            );

                            if (currentCourseIndex < allCourses.length - 1) {
                              const nextCourse = allCourses[currentCourseIndex + 1];
                              const nextCourseId = nextCourse._id;
                              const nextCourseChapters = await fetchCourseChapters(nextCourseId);
                              const nextChapters = nextCourseChapters?.data?.chapters || [];

                              if (nextChapters.length > 0) {
                                const firstChapter = nextChapters[0];
                                const firstSection = firstChapter?.sections?.[0];
                                if (firstSection) {
                                  router.push(
                                    `/valliani-university/courses/${nextCourseId}?chapter=${firstChapter._id}&section=${firstSection._id}`
                                  );
                                  toast.success('Moving to next course...');
                                  return;
                                }
                              }
                            }

                            toast.success('All videos completed!');
                          } catch (error: any) {
                            console.error('Navigation error:', error);
                            toast.error('Failed to navigate');
                          }
                        }}
                        className="group flex items-center gap-3 px-6 py-4 bg-[#EDE8D0] text-[#6f4e37] rounded-xl hover:from-[#EDE8D0]  transition-all duration-300 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105"
                      >
                        <span>Go to Next Chapter</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </button>
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
                  <div className="bg-[#6f4e37] px-8 py-12 text-center">
                    <h1 className="text-5xl font-bold text-white mb-4">
                      Chapter Quiz
                    </h1>
                    <p className="text-xl text-white">
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
                    courseId={courseId}
                    chapterId={derivedChapterId}
                    onNavigate={navigateToSectionOrQuiz}
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



