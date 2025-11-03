import React from 'react';

const Quiz = ({ setIsQuizOpen }:any) => {
  return (
    <div className="p-5 flex flex-col w-full gap-4">
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <span className="font-bold">Date:</span>
          <span className="text-brand-muted">12/12/25</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Time Limit:</span>
          <span className="text-brand-muted">15 min</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Attempts:</span>
          <span className="text-brand-muted">Twice</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="font-bold">Pass Points:</span>
          <span className="text-brand-muted">33.33%</span>
        </div>
      </div>
      <div className="w-full">
        <button onClick={()=> setIsQuizOpen(true)} className="bg-[#1935CA] rounded-lg px-10 py-5 text-white w-full">
          Start Quiz
        </button>
      </div>
    </div>
  );
};

export default Quiz;
