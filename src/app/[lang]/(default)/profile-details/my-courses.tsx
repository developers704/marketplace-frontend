import React from 'react';
import { GoUnlock } from 'react-icons/go';
import { MdOutlineFileDownload } from 'react-icons/md';
import { IoEyeOutline } from 'react-icons/io5';

const MyCourses = () => {
  return (
    <div>
      <h1 className="text-2xl text-[#0081FE] font-semibold mb-5">My Courses</h1>
      <div className="flex flex-col gap-4">
        <div id="table">
          <div className="flex items-center w-full border-b-[4px] border-[#ABAFB1] py-3 px-2">
            <div className="w-full flex-[3] font-bold text-lg">Course</div>
            <div className="w-full flex-1 font-bold text-lg">Status</div>
            <div className="w-full flex-1 font-bold text-lg">Weight</div>
            <div className="w-full flex-1 font-bold text-lg">Grade</div>
            <div className="w-full flex-1 font-bold text-lg">Certificate</div>
          </div>
          <div className="border-[2px] border-[#ABAFB1] rounded-lg my-5 px-2">
            {[1, 4].map((item) => {
              return (
                <div className="flex items-center w-full border-b-[2px] border-brand-muted py-4 px-2">
                  <div className="w-full flex items-center gap-4 flex-[3]">
                    {' '}
                    <GoUnlock className="text-xl" />{' '}
                    <div>
                      <strong>Sales and Customer Service</strong>
                      <p className="text-[#0081FE]">Approx. 21 hours</p>
                      <div>5 Videos</div>
                    </div>{' '}
                  </div>
                  <div className={`w-full flex-1 text-lg text-green-500`}>Done</div>
                  <div className="w-full flex-1 text-lg">33.33%</div>
                  <div className="w-full flex-1 text-lg">A</div>
                  <div className="w-full flex-1 text-xl flex gap-4">
                    <MdOutlineFileDownload/>
                    <IoEyeOutline/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyCourses;
