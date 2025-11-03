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

export default function QuizPage({ isCompleted, quizData }: any) {
  const router = useRouter();
  // const totalTime = quizData?.timeLimit * 60; // in seconds
  const totalTime = quizData?.enableTimer ? quizData?.timeLimit * 60 : 0;
  // const totalTime = 1 * 60; // in seconds
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<any>();
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
      const shuffled = quizData?.enableSuffling
        ? shuffleArray(quizData?.questions)
        : quizData?.questions;
      setShuffledQuestions(shuffled);
    }
  }, [quizData]);

  useEffect(() => {
    if (!quizData?.enableTimer) return; // ⛔ Skip if timer is disabled
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

  const handleAnswerSelect = (option: string) => {
    if (current.type === 'single') {
      setSelectedAnswers([option]);
    } else {
      setSelectedAnswers((prev) =>
        prev.includes(option)
          ? prev.filter((o) => o !== option)
          : [...prev, option],
      );
    }
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

  // const saveAnswer = (answers: string[], questionIndex: number) => {
  //   // const currentQ = quizData?.questions[questionIndex];
  //   const currentQ = shuffledQuestions[questionIndex];
  //   const answerIndexes =
  //     currentQ.type === 'multiple'
  //       ? answers
  //           .map((ans) => currentQ.options.indexOf(ans))
  //           .filter((i) => i !== -1)
  //       : currentQ.options.indexOf(answers[0]);

  //   const entry = {
  //     questionIndex: currentQ.originalIndex,
  //     selectedAnswer: answerIndexes,
  //   };

  //   setUserAnswers((prev) => [...prev, entry]);
  // };

  const saveAnswer = (answers: string[], questionIndex: number) => {
    const currentQ = shuffledQuestions[questionIndex];
    const answerIndexes =
      currentQ.type === 'multiple'
        ? answers
            .map((ans) => currentQ.options.indexOf(ans))
            .filter((i) => i !== -1)
        : currentQ.options.indexOf(answers[0]);

    const entry = {
      questionIndex: currentQ.originalIndex, // ✅ Use originalIndex here
      selectedAnswer: answerIndexes,
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
    saveAnswer(selectedAnswers, currentQuestion);
    if (currentQuestion < quizData?.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
      setSelectedAnswers([]); // reset for next question
      setIsSubmitted(false);
    } else {
      // saveAnswer(selectedAnswers, currentQuestion);
      handleEndQuiz();
    }
  };

  // const handleEndQuiz = async () => {
  //   // const currentQ = quizData?.questions[currentQuestion];
  //   const currentQ = shuffledQuestions[currentQuestion];

  //   const answerIndexes =
  //     currentQ.type === 'multiple'
  //       ? selectedAnswers
  //           .map((ans) => currentQ.options.indexOf(ans))
  //           .filter((i) => i !== -1)
  //       : currentQ.options.indexOf(selectedAnswers[0]);

  //   const lastEntry = {
  //     questionIndex: currentQuestion,
  //     selectedAnswer: answerIndexes,
  //   };

  //   const finalAnswers = [...userAnswers, lastEntry]; // ✅ create full array including last

  //   const endTime = new Date().toISOString();
  //   const payload = {
  //     answers: finalAnswers,
  //     startTime,
  //     endTime,
  //   };

  //   console.log(payload, 'quizData payload'); // ✅ now includes all answers
  //   if (payload) {
  //     const res = await submitQuizApi(quizData?._id, payload);
  //     setQuizResult(res);
  //     // console.log(res, 'quizData res');
  //   }

  //   setUserAnswers(finalAnswers); // optional, if needed elsewhere
  //   setCompleted(true);
  // };

  const handleEndQuiz = async () => {
    const currentQ = shuffledQuestions[currentQuestion];
    const answerIndexes =
      currentQ.type === 'multiple'
        ? selectedAnswers
            .map((ans) => currentQ.options.indexOf(ans))
            .filter((i) => i !== -1)
        : currentQ.options.indexOf(selectedAnswers[0]);

    const lastEntry = {
      questionIndex: currentQ.originalIndex, // ✅ Use originalIndex here
      selectedAnswer: answerIndexes,
    };

    const finalAnswers = [...userAnswers, lastEntry];
    const endTime = new Date().toISOString();

    const payload = {
      answers: finalAnswers,
      startTime,
      endTime,
    };

    const res = await submitQuizApi(quizData?._id, payload);
    setQuizResult(res);
    setUserAnswers(finalAnswers);
    setCompleted(true);
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
    const percentage = ((score / questions.length) * 100).toFixed(2);
    // setTimeout(() => {
    //   window.location.reload();
    // }, 5000);
    return (
      <div className="max-w-xl mx-auto p-6 text-center space-y-6">
        <h2 className="text-2xl font-bold">Quiz Submitted!</h2>
        <p className="text-lg">{quizResult?.result.message}</p>
        <p className="text-lg">Grade: {quizResult?.result.grade}</p>
        <p className="text-lg">Percentage: {quizResult?.result.percentage}%</p>
        <p className="text-xl font-semibold">
          Score: {quizResult?.result.score}
        </p>
        <button
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded"
          onClick={() => {
            isCompleted(false);
            if (quizResult?.result.grade === 'F') {
              router.push(`/valliani-university/tasks`);
            } else {
              router.push(`/valliani-university/achievements`);
            }
          }}
        >
          Continue
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-[25px] font-bold text-brand-blue">
          Question {currentQuestion + 1} of {quizData?.totalQuestions}
        </h2>
        {/* <div className="text-[25px] bg-white px-2 py-1 rounded-lg shadow-md">
          ⏱ {formatTime(timeLeft)}
        </div> */}
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
          const isSelected = selectedAnswers?.includes(option);
          return (
            <label
              key={index}
              className={`flex items-center gap-3 p-3 rounded border cursor-pointer
                
              `}
            >
              {current.type === 'multiple' ? (
                <input
                  type="checkbox"
                  disabled={isSubmitted}
                  // checked={isSelected}
                  onChange={() => handleAnswerSelect(option)}
                />
              ) : (
                <input
                  type="radio"
                  name="answer"
                  disabled={isSubmitted}
                  checked={isSelected}
                  onChange={() => handleAnswerSelect(option)}
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
        {quizData?.questions.length - 1 === currentQuestion ? (
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
