'use client';

import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import Swal from 'sweetalert2';
import { submitQuizApi } from '@/framework/basic-rest/university/dashboardApi';
import { useRouter } from 'next/navigation';

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

export default function QuizPage({ isCompleted, quizData, refetchChapters, refetchSectionData }: any) {
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

  if (completed) {
    const percentage = ((score / questions?.length) * 100).toFixed(2);
    // setTimeout(() => {
    //   window.location.reload();
    // }, 5000);
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-6">
        <h2 className="text-2xl font-bold">Quiz Submitted!</h2>
        <p className="text-lg">{quizResult?.result?.message}</p>
        <p className="text-lg">Grade: {quizResult?.result?.grade}</p>
        <p className="text-lg">Percentage: {quizResult?.result?.percentage}%</p>
        <p className="text-xl font-semibold">
          Score: {quizResult?.result?.score}
        </p>
        {/* <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          onClick={() => {
            isCompleted(false);
            if (quizResult?.result?.grade === 'F') {
              router.push(`/valliani-university/tasks`);
            } else {
              router.push(`/valliani-university/achievements`);
            }
          }}
        >
          Continue
        </button> */}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[25px] font-bold text-gary-500">
          Question {currentQuestion + 1} of {quizData?.totalQuestions}
        </h2>
        {quizData?.enableTimer && (
          <div className="text-[25px] bg-white px-2 py-1 rounded-lg shadow-md">
            ⏱ {formatTime(timeLeft)}
          </div>
        )}
      </div>

      <div className="mb-4">
        <h3 className="text-lg font-medium">{current?.question}</h3>
        {/* {current.type === 'multiple' && (
          <>
            <p className="text-brand-blue">(Select All That Apply)</p>
          </>
        )} */}
      </div>

      <div className="space-y-3">
        {current?.options?.map((option: any, index: number) => {
          const isSelected = selectedAnswerIndex === index;
          return (
            <label
              key={index}
              className={`flex items-center gap-3 p-3 rounded border cursor-pointer
                
              `}
            >
              {current?.type === 'multiple' ? (
                <input
                  type="checkbox"
                  disabled={isSubmitted}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(index)}
                />
              ) : (
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  disabled={isSubmitted}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(index)}
                />
              )}
              <span>{option}</span>
              {/* {isSubmitted && isCorrect && (
                <Check className="w-4 h-4 text-green-600 ml-auto" />
              )} */}
            </label>
          );
        })}
      </div>

      <div className="mt-6 flex justify-end">
        {quizData?.questions?.length - 1 === currentQuestion ? (
          <button
            onClick={handleNext}
            // onClick={() => {
            //   saveAnswer(selectedAnswers, currentQuestion); // pass current selected answer // Save the last answer
            //   handleEndQuiz(); // Then end the quiz
            // }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          >
            submit
          </button>
        ) : (
          <>
            <button
              onClick={handleNext}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
            >
              Next
            </button>
          </>
        )}
      </div>
    </div>
  );
}
