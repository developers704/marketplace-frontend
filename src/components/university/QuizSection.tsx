'use client';
import React, { useEffect, useState } from 'react';
import { CalendarDays, Clock, RefreshCw, Target, Play } from 'lucide-react';
import QuizModal from '../quiz/quiz-popup';
import QuizPage from '../quiz/quiz-popup';
import { toast } from 'react-toastify';

const QuizStart = ({ setIsQuizOpen, quizData, setActiveSidebar }: any) => {
  // console.log(quizData, 'quizData');
  const quizStartHandler = () => {
    if (quizData?.canAttempt) {
      setIsQuizOpen(true);
    } else {
      toast.error(
        `You are not eligible for the quiz, please complete the course first`,
      );
      setActiveSidebar(1);
    }
  };
  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
      <h1 className="font-semibold text-gray-700 text-lg">{quizData?.title}</h1>
      <div className="space-y-4">
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
        className="w-full bg-brand-blue hover:bg-[#152ca5] text-white font-semibold py-3 rounded-xl transition duration-300 shadow-md flex items-center justify-center gap-2"
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
}: any) => {
  
  return (
    <div className="p-8">
      <div className="pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize">
          Quiz
        </h1>
      </div>
      <div className="">
        {isQuizStarted ? (
          <>
            <QuizPage isCompleted={setIsQuizStarted} quizData={quizData} />
          </>
        ) : (
          <>
            {quizData?.userAttempts.passed ? (
              <>
                <div className="max-w-xl mx-auto p-6 text-center space-y-6">
                  <h2 className="text-2xl font-bold">Quiz Completed!</h2>
                  <p className="text-lg ">
                    <span className="font-semibold">Grade:</span>{' '}
                    {quizData?.userAttempts?.bestGrade}
                  </p>
                  <p className="text-lg">
                    <span className="font-semibold">Percentage:</span>{' '}
                    {quizData?.userAttempts?.bestPercentage}%
                  </p>
                  <p className="text-xl">
                    <span className="font-semibold">Score:</span>{' '}
                    {quizData?.userAttempts?.bestScore}
                  </p>
                </div>
              </>
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
