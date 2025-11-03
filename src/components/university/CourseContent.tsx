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

interface ContentSection {
  title: string;
  items: string[];
}

interface LessonContent {
  title: string;
  sections: ContentSection[];
}

const lessonContent: LessonContent = {
  title: 'Sales Goals',
  sections: [
    {
      title: 'Purpose/Benefit',
      items: [
        'To establish measurable targets for team success.',
        'To keep Team Members accountable.',
        'Help team members reach goals and feel accomplished.',
      ],
    },
    {
      title: 'Tools Needed',
      items: ['POS', 'Calculator', 'Schedule', 'Sales Plan for Day and Month.'],
    },
    {
      title: 'Completion Timeline',
      items: [
        'Daily - Sales goals entered every morning.',
        'Weekly - Daily sales goals calculated weekly.',
        'Monthly - Beginning of each month.',
      ],
    },
    {
      title: 'Key Information',
      items: ['New hires sales goals started as they joined.'],
    },
  ],
};

const navigationItems = [
  {
    id: 1,
    title: 'Introduction',
    isActive: true,
    hasSubItems: false,
    subItems: [],
  },
  {
    id: 2,
    title: 'Objective',
    isActive: false,
    hasSubItems: false,
    subItems: [
      'Set clear and achievable sales goals.',
      'Establish and maintain performance standards.',
      'Explain and track incentive programs effectively.',
      'Evaluate trade-ins to boost profitability.',
      'Manage the store to optimize performance.',
    ],
  },
  {
    id: 3,
    title: 'Videos',
    isActive: false,
    hasSubItems: true,
    subItems: [
      'Set clear and achievable sales goals.',
      'Establish and maintain performance standards.',
      'Explain and track incentive programs effectively.',
      'Evaluate trade-ins to boost profitability.',
      'Manage the store to optimize performance.',
    ],
  },
  // {
  //   id: 4,
  //   title: 'Scan, Focus, Act',
  //   isActive: false,
  //   hasSubItems: false,
  //   subItems: [],
  // },
  // {
  //   id: 5,
  //   title: 'The Strategy Session',
  //   isActive: false,
  //   hasSubItems: false,
  //   subItems: [],
  // },
  // {
  //   id: 6,
  //   title: 'Sales - Summary',
  //   isActive: false,
  //   hasSubItems: false,
  //   subItems: [],
  // },
];

interface CourseContentProps {
  onBack: () => void;
}

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
                {/* {lessonContent.sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="text-gray-400 mr-3 mt-1">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))} */}
                {/* {content} */}
                <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
              </div>
            </div>

            {/* Illustration */}
            {/* <div className="ml-8 flex-shrink-0">
              <img
                src={`/assets/images/contentImage.png`}
                alt="Sales Goals Illustration"
                className="w-[250px] h-auto object-contain"
                style={{ opacity: 0.8 }}
              />
            </div> */}
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
                {/* {lessonContent.sections.map((section, index) => (
                  <div key={index}>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                      {section.title}
                    </h2>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <span className="text-gray-400 mr-3 mt-1">•</span>
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))} */}
                <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
              </div>
            </div>

            {/* Illustration */}
            {/* <div className="ml-8 flex-shrink-0">
              <img
                src={`/assets/images/contentImage.png`}
                alt="Sales Goals Illustration"
                className="w-[250px] h-auto object-contain"
                style={{ opacity: 0.8 }}
              />
            </div> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default function CourseContent({
  sectionData,
  refetchSectionData,
}: any) {
  const params = useParams() as { chapterId: string; sectionId: string };
  // console.log(params, 'params');
  const { chapterId: courseId, sectionId } = params;
  // Add this state to manage expanded sidebar items
  const [expandedSidebarItems, setExpandedSidebarItems] = useState<number[]>([
    2,
  ]);
  const [activeSidebar, setActiveSidebar] = useState<any>(1);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [isQuizStarted, setIsQuizStarted] = useState<any>(false);
  const [videoReaction, setVideoReaction] = useState<any>('');
  const [watchedDuration, setWatchedDuration] = useState<any>(0);
  const router = useRouter();
  const toggleSidebarItem = (itemId: number) => {
    setExpandedSidebarItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
    setActiveSidebar(itemId);
  };

  // 🚫 Block browser reload/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isQuizStarted) {
        e.preventDefault();
        e.returnValue = ''; // required for Chrome
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
    const res = await videoProgress(
      courseId,
      sectionData?.chapterId,
      sectionId,
      selectedVideo,
      videoData,
    );
    if (res?.success === true) {
      refetchSectionData();
      if (res?.data?.nextContent?.navigationType === 'quiz') {
        setActiveSidebar('quiz');
      } else if (res?.data?.nextContent?.navigationType === 'content') {
        setSelectedVideo(res?.data?.nextContent?.content?._id);
        setActiveSidebar(3);
      }
    }
    console.log(res, 'res from next video');
  };

  const videoReactionHandler = async (reaction: any) => {
    // const reaction = videoReaction
    const res = await toggleVideoReactions(
      courseId,
      sectionData?.chapterId,
      sectionId,
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
    <div className="min-h-screen bg-gray-50 flex gap-5">
      {/* Sidebar Navigation */}
      <div className="w-64 h-fit bg-white shadow-md border-r rounded-lg border-gray-200">
        <div className="p-4">
          <nav className="space-y-1">
            {navigationItems.map((item) => {
              const isActive = activeSidebar === item.id;
              return (
                <div key={item.id}>
                  <div
                    className={`flex items-center px-3 py-2 text-sm rounded-md cursor-pointer ${
                      isActive
                        ? 'bg-gray-200 text-gray-900 font-medium'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                    onClick={() => {
                      isQuizStarted
                        ? alert('Quiz is in progress, finish the quiz!')
                        : toggleSidebarItem(item.id);
                    }}
                  >
                    <span className="mr-3 text-gray-400">{item.id}.</span>
                    {item.title}
                    {item.hasSubItems && (
                      <ChevronDown
                        className={`ml-auto w-4 h-4 transition-transform ${
                          expandedSidebarItems.includes(item.id)
                            ? 'transform rotate-180'
                            : ''
                        }`}
                      />
                    )}
                  </div>

                  {item.hasSubItems &&
                    expandedSidebarItems.includes(item.id) && (
                      <div className="ml-8 mt-2 space-y-1">
                        {sectionData?.content?.map(
                          (video: any, index: number) => (
                            <div
                              key={index}
                              className={`text-blue-500 text-lg hover:text-blue-700 hover:underline text-left ${
                                !sectionData.canAccess
                                  ? 'opacity-50 cursor-not-allowed'
                                  : 'cursor-pointer'
                              }`}
                              onClick={() => setSelectedVideo(video?._id)}
                            >
                              <span className="text-gray-400 mr-2 text-sm">
                                {index + 1}.
                              </span>
                              <span className="text-gray-600 text-sm">
                                {video?.title}
                              </span>
                            </div>
                          ),
                        )}
                      </div>
                    )}
                </div>
              );
            })}

            {/* Additional items */}
            <div className="pt-4 mt-4 border-t border-gray-200">
              <div
                className="flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer"
                onClick={() => quizRouteHandler()}
              >
                Quiz
                {/* {!sectionData?.quiz?.canAttempt &&
                  !sectionData?.quiz?.userAttempts.passed &&
                  sectionData?.quiz?.userAttempts.remainingAttempts === 0 &&
                  sectionData?.quiz?.userAttempts.bestGrade === 'F' && (
                    <FaLock />
                  )} */}
                {sectionData?.quiz?.userAttempts.passed ? (
                  <FaCheckCircle className="text-green-500 ml-2" />
                ) : !sectionData?.quiz?.canAttempt ? (
                  <FaLock />
                ) : (
                  <></>
                )}
              </div>
              {/* <div className="flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md cursor-pointer">
                Scenario
              </div> */}
            </div>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-fit bg-white shadow-md rounded-lg">
        {activeSidebar === 3 && selectedVideo ? (
          <div className="pt-6">
            <VideoSectionContent
              videoId={selectedVideo}
              content={sectionData?.content}
              setWatchedDuration={setWatchedDuration}
              videoReactionHandler={videoReactionHandler}
              refetchSectionData={refetchSectionData}
            />
            <div className="rounded-lg bg-white px-8 py-4">
              <div className="max-w-4xl mx-auto flex justify-between">
                <button
                  onClick={() => router.back()}
                  className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => nextVideoHandler()}
                  className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </div>
          </div>
        ) : activeSidebar === 'quiz' ? (
          <>
            <QuizSection
              isQuizStarted={isQuizStarted}
              setIsQuizStarted={setIsQuizStarted}
              quizData={sectionData?.quiz}
              setActiveSidebar={setActiveSidebar}
            />
          </>
        ) : activeSidebar === 1 ? (
          <IntroductionComp content={sectionData?.introduction} />
        ) : activeSidebar === 2 ? (
          <ObjectiveComp content={sectionData?.objective} />
        ) : (
          <>
            <div className="flex-1 p-8">
              <div className="max-w-4xl mx-auto">
                <p>Select a video</p>
              </div>
            </div>
          </>
        )}
        {/* Dynamic karni hy */}

        {/* Navigation Footer */}
        {/* {!isQuizStarted && (
          <div className="rounded-lg bg-white px-8 py-4">
            <div className="max-w-4xl mx-auto flex justify-between">
              <button
                onClick={() => router.back()}
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </button>
              <button className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
}
