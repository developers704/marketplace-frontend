'use client';
import React, { useState } from 'react';
import { MdOutlineKeyboardArrowDown } from 'react-icons/md';

const ShowMoreDropdown = ({ items, initial, setLimit }: any) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-2 py-1 text-sm bg-white text-black rounded-md flex gap-1 items-center"
      >
        {initial} <MdOutlineKeyboardArrowDown />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-300 rounded-md shadow-lg overflow-hidden z-50">
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer transition"
              onClick={() => setLimit(item)}
            >
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShowMoreDropdown;
