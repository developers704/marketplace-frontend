'use client';
import React from 'react';
import { MdKeyboardArrowDown } from 'react-icons/md';
import { useState } from 'react';
import { CiLock } from 'react-icons/ci';

const OptionsSection = ({
  handleCourseInfoClick,
  handleCourseHistoryClick,
  goToVideo,
}: any) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="p-5 flex flex-col w-full gap-4">
      <div
        className="border-b-[1px] border-brand-muted p-2 font-bold cursor-pointer"
        onClick={handleCourseInfoClick}
      >
        Course Info
      </div>
      <div
        className="border-b-[1px] border-brand-muted p-2 font-bold cursor-pointer flex items-center justify-between"
        onClick={() => {
          goToVideo();
          setOpen(!open);
        }}
      >
        <div>Sections</div>
        <div>
          <MdKeyboardArrowDown
            className={`text-xl lg:text-2xl text-brand-dark text-opacity-60 group-hover:text-opacity-100 -mr-2 lg:-mr-1.5 shrink-0 ${
              open ? 'transform -rotate-180' : ''
            }`}
          />
        </div>
      </div>
      {open && (
        <div className="flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((item) => {
            return (
              <div className="flex items-center justify-between">
                <input type="checkbox" />
                <p className="font-bold">Section {item}</p>
                <div className="bg-[#C7E4FF] text-[10px] text-[#0081FE] p-1 rounded">
                  40min
                </div>
                <div>
                  <CiLock />
                </div>
              </div>
            );
          })}
        </div>
      )}
      <div
        className="border-b-[1px] border-brand-muted p-2 font-bold cursor-pointer"
        onClick={handleCourseHistoryClick}
      >
        Course History
      </div>
    </div>
  );
};

export default OptionsSection;
