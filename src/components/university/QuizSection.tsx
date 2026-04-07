'use client';
import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, RefreshCw, Target, Play, ArrowRight, Medal } from 'lucide-react';
import QuizModal from '../quiz/quiz-popup';
import QuizPage from '../quiz/quiz-popup';
import { toast } from 'react-toastify';
import { fetchCustomerCourses, fetchCourseChapters } from '@/framework/basic-rest/university/dashboardApi';
import { useRouter } from 'next/navigation';

const QuizStart = ({ setIsQuizOpen, quizData, setActiveSidebar }: any) => {

  console.log("quizData", quizData)
  const quizStartHandler = () => {
    if (quizData) {
      setIsQuizOpen(true);
    } else {
      toast.error(
        `You are not eligible for the quiz, please complete the course first`,
      );
      // setActiveSidebar(1);
    }
  };
  return (
    <div className="w-full max-w-md  mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6 cursor-pointer border border-gray-100 hover:shadow-2xl transition-shadow duration-300 ">
      <h1 className="font-semibold text-gray-700 text-lg">{quizData?.title}</h1>
      <div className="space-y-4 ">
        {/* <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <CalendarDays size={16} /> Date:
          </span>
          <span className="text-gray-500">12/12/25</span>
        </div> */}
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Clock size={16} /> Time Limit:
          </span>
          <span className="text-gray-500">{quizData?.timeLimit || 0} min</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <RefreshCw size={16} /> Attempts:
          </span>
          <span className="text-gray-500">{quizData?.maxAttempts}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2 font-semibold text-gray-700">
            <Target size={16} /> Pass Points:
          </span>
          <span className="text-gray-500">
            {quizData?.passingScore || 'N/A'}
          </span>
        </div>
      </div>

      <button
        onClick={() => quizStartHandler()}
        className="w-full bg-[#EDE8D0]  text-[#6f4e37] font-semibold py-3 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2"
      >
        <Play size={18} /> Start Quiz
      </button>
    </div>
  );
};

const QuizSection = ({
  isQuizStarted,
  setIsQuizStarted,
  quizData,
  setActiveSidebar,
  refetchChapters,
  refetchSectionData,
  courseId,
  chapterId,
  onNavigate,
}: any) => {
  const router = useRouter();

  // Navigate to next chapter or next course
  const handleNavigateNext = async () => {
    try {
      // First, refetch chapters to get updated data
      if (refetchChapters) {
        await refetchChapters();
      }

      // Get current course chapters
      if (!courseId) {
        toast.error('Course ID not found');
        return;
      }

      const chaptersResponse = await fetchCourseChapters(courseId);
      const chapters = chaptersResponse?.data?.chapters || [];

      // Find current chapter index
      const currentChapterIndex = chapters.findIndex(
        (ch: any) => ch._id === chapterId
      );

      if (currentChapterIndex === -1) {
        toast.error('Current chapter not found');
        return;
      }

      // Check if there's a next chapter in current course
      if (currentChapterIndex < chapters.length - 1) {
        // Navigate to next chapter's first section
        const nextChapter = chapters[currentChapterIndex + 1];
        const nextSection = nextChapter?.sections?.[0];

        if (nextSection) {
          if (onNavigate) {
            await onNavigate(nextSection);
          } else {
            // Fallback: navigate via router
            router.push(
              `/valliani-university/courses/${courseId}?chapter=${nextChapter._id}&section=${nextSection._id}`
            );
          }
          toast.success('Moving to next chapter...');
          return;
        }
      }

      // Course is complete, check for next course
      const customerCoursesResponse = await fetchCustomerCourses();
      const allCourses = customerCoursesResponse?.data || [];

      // Find current course index
      const currentCourseIndex = allCourses.findIndex(
        (course: any) => course._id === courseId
      );

      if (currentCourseIndex === -1) {
        toast.info('Course completed! No next course available.');
        return;
      }

      // Check if there's a next course
      if (currentCourseIndex < allCourses.length - 1) {
        const nextCourse = allCourses[currentCourseIndex + 1];
        const nextCourseId = nextCourse._id;

        // Get next course chapters
        const nextCourseChapters = await fetchCourseChapters(nextCourseId);
        const nextChapters = nextCourseChapters?.data?.chapters || [];

        if (nextChapters.length > 0) {
          const firstChapter = nextChapters[0];
          const firstSection = firstChapter?.sections?.[0];

          if (firstSection) {
            // Navigate to next course's first chapter's first section
            router.push(
              `/valliani-university/courses/${nextCourseId}?chapter=${firstChapter._id}&section=${firstSection._id}`
            );
            toast.success('Moving to next course...');
            return;
          }
        }
      }

      // No next course available
      toast.success('Congratulations! You have completed all available courses.');
    } catch (error: any) {
      console.error('Navigation error:', error);
      toast.error('Failed to navigate to next chapter/course');
    }
  };

  // Determine button text based on available navigation
  const [buttonText, setButtonText] = React.useState('Go to Next Chapter');
  
  React.useEffect(() => {
    const checkNextNavigation = async () => {
      if (!courseId || !chapterId) return;
      
      try {
        const chaptersResponse = await fetchCourseChapters(courseId);
        const chapters = chaptersResponse?.data?.chapters || [];
        const currentChapterIndex = chapters.findIndex((ch: any) => ch._id === chapterId);
        
        if (currentChapterIndex < chapters.length - 1) {
          setButtonText('Go to Next Chapter');
        } else {
          // Check for next course
          const customerCoursesResponse = await fetchCustomerCourses();
          const allCourses = customerCoursesResponse?.data || [];
          const currentCourseIndex = allCourses.findIndex((course: any) => course._id === courseId);
          
          if (currentCourseIndex < allCourses.length - 1) {
            setButtonText('Go to Next Course');
          } else {
            setButtonText('Course Completed');
          }
        }
      } catch (error) {
        console.error('Error checking navigation:', error);
      }
    };
    
    if (quizData?.userAttempts?.totalAttempts > 0) {
      checkNextNavigation();
    }
  }, [quizData, courseId, chapterId]);

  console.log("quizData in quizSection", quizData)
  return (
    <div className="">
      <div className="pb-6">
        {/* <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Quiz
        </h1> */}
      </div>
      <div className="">
        {isQuizStarted ? (
          <>
            <QuizPage 
              isCompleted={setIsQuizStarted} 
              quizData={quizData}
              refetchChapters={refetchChapters}
              refetchSectionData={refetchSectionData}
              courseId={courseId}
              chapterId={chapterId}
              onNavigate={onNavigate}
            />
          </>
        ) : (
          <>
            {quizData?.userAttempts?.totalAttempts > 0 ? (
            <div className="max-w-xl mx-auto px-4 py-10 text-center">
              {/* Result Card */}
              <div className="relative rounded-3xl bg-white border border-gray-200 shadow-xl overflow-hidden">
                
                {/* Top Gradient Strip */}
                <div className="h-2 bg-[#EDE8D0]" />

                <div className="p-8 space-y-6">
                  {/* Icon */}
                  <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-[#EDE8D0] shadow-sm">
                    <Medal />
                  </div>

                  {/* Title */}
                  <h2 className="text-3xl font-bold text-gray-900">
                    Quiz Completed
                  </h2>
                  <p className="text-gray-500">
                    Here’s how you performed in this assessment
                  </p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6">
                    {/* Grade */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Grade
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {quizData?.userAttempts?.bestGrade}
                      </p>
                    </div>

                    {/* Percentage */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Percentage
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {quizData?.userAttempts?.bestPercentage}%
                      </p>
                    </div>

                    {/* Score */}
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        Score
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {quizData?.userAttempts?.bestScore}
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="h-px bg-gray-200" />

                  {/* Action Button */}
                  <button
                    onClick={handleNavigateNext}
                    className="
                      w-full py-4 rounded-xl font-semibold text-[#6f4e37]
                      bg-[#EDE8D0]
                      transition-all duration-300
                      shadow-lg hover:shadow-xl
                      flex items-center justify-center gap-2
                      transform hover:-translate-y-0.5
                    "
                  >
                    <ArrowRight className="w-5 h-5" />
                    {buttonText}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <QuizStart
              setIsQuizOpen={setIsQuizStarted}
              quizData={quizData}
              setActiveSidebar={setActiveSidebar}
            />
          )}

          </>
        )}
      </div>
    </div>
  );
};

export default QuizSection;
