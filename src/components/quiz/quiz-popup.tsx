'use client';

import { useEffect, useState } from 'react';
import { Check, ArrowRight, Clock7 } from 'lucide-react';
import Swal from 'sweetalert2';
import { submitQuizApi, fetchCustomerCourses, fetchCourseChapters } from '@/framework/basic-rest/university/dashboardApi';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
type QuestionType = {
  question: string;
  options: string[];
  correctAnswers: string[]; // support both single and multiple correct answers
  type: 'single' | 'multiple';
};

const questions: QuestionType[] = [
  {
    question: 'Which are primary colors?',
    options: ['Red', 'Green', 'Blue', 'Yellow'],
    correctAnswers: ['Red', 'Blue', 'Yellow'],
    type: 'multiple',
  },
  {
    question: 'What is the capital of France?',
    options: ['Paris', 'London', 'Rome', 'Berlin'],
    correctAnswers: ['Paris'],
    type: 'single',
  },
  // Add more questions...
];

export default function QuizPage({ isCompleted, quizData, refetchChapters, refetchSectionData, courseId, chapterId, onNavigate }: any) {
  const router = useRouter();
  // const totalTime = quizData?.timeLimit * 60; // in seconds
  const totalTime = quizData?.enableTimer ? quizData?.timeLimit * 60 : 0;
  // const totalTime = 1 * 60; // in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // Track the chosen option index (backend expects numeric index)
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [quizResult, setQuizResult] = useState<any>();

  const [startTime] = useState(new Date().toISOString());
  const [userAnswers, setUserAnswers] = useState<
    { questionIndex: number; selectedAnswer: number | number[] }[]
  >([]);
  const [shuffledQuestions, setShuffledQuestions] = useState<
    (QuestionType & { originalIndex: number })[]
  >([]);

  const shuffleArray = (array: any[]) => {
    return [...array].sort(() => Math.random() - 0.5);
  };

  useEffect(() => {
    if (quizData?.questions) {
      // Preserve original index so backend can map answers correctly
      const baseQuestions = quizData.questions.map((q: any, idx: number) => ({
        ...q,
        originalIndex: idx,
      }));

      const shuffled = quizData?.enableSuffling
        ? shuffleArray(baseQuestions)
        : baseQuestions;

      setShuffledQuestions(shuffled);
      setCurrentQuestion(0);
      setSelectedAnswerIndex(null);
      setSelectedAnswers([]);
      setUserAnswers([]);
      setIsSubmitted(false);
      setCompleted(false);
      setQuizResult(null);
      setTimeLeft(totalTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quizData]);

  useEffect(() => {
    if (!quizData?.enableTimer) return;
    if (timeLeft === 0 && !completed) {
      Swal.fire("Time's up!", 'Time is up', 'warning').then(() => {
        handleEndQuiz();
      });
      return; // Exit early to prevent setting up another timer
    }

    if (timeLeft > 0) {
      // Only set timer if time is remaining
      const timer = setInterval(
        () => setTimeLeft((prev) => Math.max(0, prev - 1)),
        1000,
      );
      return () => clearInterval(timer);
    }
  }, [timeLeft, completed]);

  // const current = quizData?.questions[currentQuestion];
  const current = shuffledQuestions[currentQuestion];

  const handleAnswerSelect = (optionIndex: number) => {
    setSelectedAnswerIndex(optionIndex);
    // Keep a string array for any UI that relies on it
    const optionValue = current?.options?.[optionIndex];
    setSelectedAnswers(optionValue ? [optionValue] : []);
  };

  // console.log(quizData, 'selectedAnswers quizData');
  // console.log(current, 'selectedAnswers quizData');
  //
  const isAnswerCorrect = () => {
    const selected = [...selectedAnswers].sort().join(',');
    const correct = [...current.correctAnswers].sort().join(',');
    return selected === correct;
  };

  const getAnswerIndexes = () => {
    return selectedAnswers.map((ans) => current.options.indexOf(ans));
  };


  const saveAnswer = (selectedIndex: number | null, questionIndex: number) => {
    const currentQ = shuffledQuestions[questionIndex];
    if (selectedIndex === null || !currentQ) return;

    const entry = {
      questionIndex: currentQ.originalIndex ?? questionIndex, // ✅ Use originalIndex for backend mapping
      selectedAnswer: selectedIndex,
    };

    setUserAnswers((prev) => [...prev, entry]);
  };

  const handleSubmit = () => {
    if (isAnswerCorrect()) {
      setScore((prev) => prev + 1);
    }
    setIsSubmitted(true);
  };

  const handleNext = () => {
    saveAnswer(selectedAnswerIndex, currentQuestion);

    if (currentQuestion < (quizData?.questions?.length || 0) - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswerIndex(null);
      setSelectedAnswers([]); // reset for next question
      setIsSubmitted(false);
    } else {
      handleEndQuiz();
    }
  };


  const handleEndQuiz = async () => {
    const currentQ = shuffledQuestions[currentQuestion];
    if (!currentQ) return;

    const lastEntry =
      selectedAnswerIndex === null
        ? null
        : {
            questionIndex: currentQ.originalIndex ?? currentQuestion, // ✅ Use originalIndex here
            selectedAnswer: selectedAnswerIndex,
          };

    const finalAnswers = lastEntry ? [...userAnswers, lastEntry] : [...userAnswers];
    const endTime = new Date().toISOString();

    const payload = {
      answers: finalAnswers,
      startTime,
      endTime,
    };

    try {
      const res = await submitQuizApi(quizData?._id, payload);
      setQuizResult(res);
      setUserAnswers(finalAnswers);
      setCompleted(true);
      
      // Refresh section data and chapters to unlock next content
      if (res?.success === true) {
        try {
          await refetchSectionData?.();
        } catch (err) {
          console.error('Error refetching section data:', err);
        }
        try {
          await refetchChapters?.();
        } catch (err) {
          console.error('Error refetching chapters:', err);
        }
      }
    } catch (err: any) {
      // Handle single-attempt block for main courses
      const lastAttempt =
        err?.data?.data?.lastAttempt ||
        err?.data?.lastAttempt ||
        err?.lastAttempt;
      if (lastAttempt) {
        setQuizResult({
          success: false,
          result: {
            score: lastAttempt.score ?? 0,
            percentage: lastAttempt.percentage ?? 0,
            grade: lastAttempt.grade ?? 'F',
            passed: lastAttempt.passed ?? false,
            message: err?.message || 'Attempt already used for this quiz.',
          },
        });
        setCompleted(true);
      } else {
        console.error('Quiz submit failed:', err);
      }
    }
  };

  // console.log(userAnswers, 'userAnswers quizData');
  const formatTime = (seconds: number) => {
    // Ensure seconds never goes below 0
    const safeSeconds = Math.max(0, seconds);
    const m = Math.floor(safeSeconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (safeSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

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
  const [buttonText, setButtonText] = useState('Go to Next Chapter');
  
  useEffect(() => {
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
    
    if (completed) {
      checkNextNavigation();
    }
  }, [completed, courseId, chapterId]);

  if (completed) {
    const percentage = ((score / questions?.length) * 100).toFixed(2);
    const passed = quizResult?.result?.passed || false;
    
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-6 ">
        <div className={`p-6 rounded-2xl ${!passed ? '  border-[#6f4e37]' : 'bg-red-50 border-2 border-red-400'}`}>
          <h2 className="text-3xl font-bold mb-4">{passed ? 'Congratulations!' : 'Quiz Completed'}</h2>
          <p className="text-lg font-semibold mb-2">{quizResult?.result?.message}</p>
          <div className="space-y-2">
            <p className="text-lg">
              <span className="font-semibold">Grade:</span>{' '}
              <span className={`font-bold ${passed ? 'text-black' : 'text-black'}`}>
                {quizResult?.result?.grade}
              </span>
            </p>
            <p className="text-lg">
              <span className="font-semibold">Percentage:</span>{' '}
              <span className="font-bold">{quizResult?.result?.percentage}%</span>
            </p>
            <p className="text-xl font-semibold">
              <span className="font-semibold">Score:</span>{' '}
              <span className="font-bold">{quizResult?.result?.score}</span>
            </p>
          </div>
        </div>

        {/* Navigation Button */}
        <button
          onClick={handleNavigateNext}
          className="w-full bg-[#EDE8D0] text-[#6f4e37] font-semibold py-4 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform hover:scale-105"
        >
          <ArrowRight className="w-5 h-5" />
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
  {/* Header */}
  <div className="flex items-center justify-between mb-6">
    <h2 className="text-xl font-semibold text-[#6f4e37]">
      Question {currentQuestion + 1}
      <span className="text-gray-400 font-normal">
        {" "} / {quizData?.totalQuestions}
      </span>
    </h2>

    {quizData?.enableTimer && (
      <div className="flex items-center gap-2 bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-1 text-[#6f4e37] font-medium">
        <Clock7 size={20} />
        <span className="tabular-nums">{formatTime(timeLeft)}</span>
      </div>
    )}
  </div>

  {/* Question Card */}
  <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
    {/* Question */}
    <h3 className="text-lg font-medium text-gray-900 mb-5 leading-relaxed">
      {current?.question}
    </h3>

    {/* Options */}
    <div className="space-y-3">
      {current?.options?.map((option: any, index: number) => {
        const isSelected = selectedAnswerIndex === index;

        return (
          <label
            key={index}
            className={`
              flex items-center gap-4 p-4 rounded-lg border cursor-pointer
              transition-all
              ${
                isSelected
                  ? "border-[#6f4e37] bg-[#EDE8D0]"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
              }
              ${isSubmitted ? "cursor-not-allowed opacity-70" : ""}
            `}
          >
            {/* Input */}
            <input
              type={current?.type === "multiple" ? "checkbox" : "radio"}
              name={`question-${currentQuestion}`}
              disabled={isSubmitted}
              checked={isSelected}
              onChange={() => handleAnswerSelect(index)}
              className="w-5 h-5 accent-[#EDE8D0] cursor-pointer"
            />

            {/* Option Text */}
            <span className="text-gray-800 text-sm leading-relaxed">
              {option}
            </span>
          </label>
        );
      })}
    </div>

    {/* Footer Actions */}
    <div className="mt-8 flex justify-end">
      <button
        onClick={handleNext}
        disabled={selectedAnswerIndex === null}
        className={`
          px-6 py-2.5 rounded-lg font-medium text-[#6f4e37]
          transition-all
          ${
            selectedAnswerIndex === null
              ? "bg-[#EDE8D0] cursor-not-allowed"
              : "bg-[#EDE8D0] "
          }
        `}
      >
        {quizData?.questions?.length - 1 === currentQuestion
          ? "Submit Quiz"
          : "Next Question"}
      </button>
    </div>
  </div>
</div>

  );
}
