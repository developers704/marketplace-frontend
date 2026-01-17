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
import parse, { domToReact, HTMLReactParserOptions } from 'html-react-parser';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css';

import LoadingComp from '../common/loading';



const IntroductionComp = ({ content }: any) => {
  const safeHTML = DOMPurify.sanitize(content);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

    const options: HTMLReactParserOptions = {
    replace: (domNode: any) => {
      if (domNode.name === 'img') {
        const src = domNode.attribs.src;
        if (!images.includes(src)) setImages((prev) => [...prev, src]);

        return (
          <img
            key={src}
            src={src}
            alt={domNode.attribs.alt || 'image'}
            className="cursor-pointer max-w-full h-auto"
            onClick={() => (setIsOpen(true), setPhotoIndex(images.indexOf(src)))}
          />
        );
      }
    },
  };

  const parsedContent = parse(safeHTML, options);

 return (
   <>
  
    <div className="flex-1 p-8  w-full ">
      <div className="max-w-4xl">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">Introduction</h1> */}
        <div className="space-y-2">{parsedContent}</div>

        {isOpen && images.length > 0 && (
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => setIsOpen(false)}
            onMovePrevRequest={() =>
              setPhotoIndex((photoIndex + images.length - 1) % images.length)
            }
            onMoveNextRequest={() =>
              setPhotoIndex((photoIndex + 1) % images.length)
            }
            animationDisabled={false}
            imageTitle={`Image ${photoIndex + 1} of ${images.length}`}
          />
        )}
      </div>
    </div>
     </>
  );
};
const ObjectiveComp = ({ content }: any) => {
 
  const safeHTML = DOMPurify.sanitize(content);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [images, setImages] = useState<string[]>([]);

    const options: HTMLReactParserOptions = {
    replace: (domNode: any) => {
      if (domNode.name === 'img') {
        const src = domNode.attribs.src;
        if (!images.includes(src)) setImages((prev) => [...prev, src]);

        return (
          <img
            key={src}
            src={src}
            alt={domNode.attribs.alt || 'image'}
            className="cursor-pointer max-w-full h-auto"
            onClick={() => {setIsOpen(true); 
            setPhotoIndex(images.indexOf(src))}
            }
          />
        );
      }
    },
  };

  const parsedContent = parse(safeHTML, options);
  return (
      <>
    
    <div className="flex-1 p-8">
      <div className="max-w-4xl mx-auto">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-8">Objective</h1> */}
        <div className="space-y-2">{parsedContent}</div>

        {isOpen && images.length > 0 && (
          <Lightbox
            mainSrc={images[photoIndex]}
            nextSrc={images[(photoIndex + 1) % images.length]}
            prevSrc={images[(photoIndex + images.length - 1) % images.length]}
            onCloseRequest={() => setIsOpen(false)}
            onMovePrevRequest={() =>
              setPhotoIndex((photoIndex + images.length - 1) % images.length)
            }
            onMoveNextRequest={() =>
              setPhotoIndex((photoIndex + 1) % images.length)
            }
            animationDisabled={false}
            imageTitle={`Image ${photoIndex + 1} of ${images.length}`}
          />
        )}
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
    <div className="flex gap-5 shadow-xl rounded-lg m-4">
      {sectionsIsLoading ? (
        <div className="w-full flex justify-center items-center h-[600px]">
          <LoadingComp />
        </div>
      ) : !hasAnyContent ? (
        <div className="w-full flex flex-col justify-center items-center h-[600px] text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No content available
          </h2>
          <p className="text-gray-500 max-w-md">
            This section does not have any content yet. Please check back later.
          </p>
        </div>
      ) : (
        <div className="overflow-y-auto p-6  w-full">
          {/* UPDATED: Only show intro/objective/videos if NOT quiz page */}
          {!isQuizPage && (
            <>
              {hasIntroduction && <IntroductionComp content={sectionData?.introduction} />}
              {/* {hasObjective && <ObjectiveComp content={sectionData?.objective} />} */}

              {hasVideos && (
                <div className="mt-8">
                  {/* <h2 className="text-2xl font-semibold mb-6">Videos</h2> */}
                  <div className="space-y-4">
                    {sectionData.content.map((video: any, idx: number) => (
                      <button
                        type="button"
                        key={video._id}
                        onClick={() => {
                          const prev = sectionData.content?.[idx - 1];
                          const canOpen = idx === 0 || prev?.status === 'Completed';
                          if (!canOpen) {
                            toast.error('Please complete the previous video first');
                            return;
                          }
                          setSelectedVideo(video._id);
                        }}
                        className={`w-full text-left p-4 rounded-lg flex items-center justify-between transition ${
                          selectedVideo === video._id
                            ? 'bg-blue-50 border border-blue-200'
                            : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="text-lg font-medium text-gray-600 w-8">
                            {idx + 1}.
                          </div>
                          <div className="font-medium text-gray-800">{video.title}</div>
                          {video.duration && (
                            <div className="text-sm text-gray-500">
                              {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')} min
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {video?.status === 'Completed' ? (
                            <FaCheckCircle className="text-green-600" />
                          ) : idx > 0 && sectionData.content?.[idx - 1]?.status !== 'Completed' ? (
                            <FaLock className="text-gray-400" />
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Video Player */}
                  {selectedVideo && (
                    <div className="mt-8">
                      <VideoSectionContent
                        videoId={selectedVideo}
                        content={sectionData.content}
                        setWatchedDuration={setWatchedDuration}
                        videoReactionHandler={videoReactionHandler}
                        refetchSectionData={refetchSectionData}
                      />
                      <div className="max-w-4xl mx-auto flex justify-end mt-6">
                        <button
                          type="button"
                          onClick={nextVideoHandler}
                          className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Next
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {/* UPDATED: Quiz Section - Always show if available, especially on quiz-only page */}
          {hasQuiz && (
            <div className={`mt-8 ${isQuizPage ? 'mt-0' : 'border-t pt-10'}`}>
              {/* Optional: Quiz Title on Quiz-only page */}
              {isQuizPage && (
                <div className="text-center mb-10">
                  <h1 className="text-4xl font-bold text-gray-900 mb-4">
                    Chapter Quiz
                  </h1>
                  <p className="text-lg text-gray-600">
                    Test your knowledge to complete this chapter
                  </p>
                </div>
              )}

              <QuizSection
                isQuizStarted={isQuizStarted}
                setIsQuizStarted={setIsQuizStarted}
                quizData={sectionData.quiz}
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