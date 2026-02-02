'use client';
import { CourseCardSkeletons } from '@/components/ui/skeletons';
import CourseCard2 from '@/components/university/CourseCard2';
import CourseContent from '@/components/university/CourseContent';
import CourseCurriculum from '@/components/university/CourseCurriculum';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetCustomerCoursesQuery } from '@/framework/basic-rest/university/dashboardApi';
import React, { useState } from 'react';

const CoursePageContent = () => {
  const {
    data: userCourses,
    isLoading: courseIsLoading,
    error: courseError,
  } = useGetCustomerCoursesQuery();

  const mockFetchSuggestions = async (query: string): Promise<string[]> => {
    const fakeData = [
      'Math Basics',
      'Math Advanced',
      'Marketing',
      'Machine Learning',
    ];
    return fakeData.filter((item) =>
      item.toLowerCase().includes(query.toLowerCase()),
    );
  };

  return (
    <div>
      <div className="flex justify-between pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          Courses
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
      {courseIsLoading ? (
        Array.from({ length: 6 }).map((_, index) => (
          <CourseCardSkeletons key={index} />
        ))
      ) : userCourses?.data?.length > 0 ? (
        // ✅ CRITICAL FIX: Filter to show only main courses (courseType === 'Course')
        // Short courses should only appear in the Short Courses tab
        userCourses?.data
          ?.filter((course: any) => course?.courseType === 'Course')
          ?.map((course: any) => (
            <CourseCard2 key={course?._id} data={course} />
          ))
      ) : (
        <div className="col-span-full flex justify-center items-center py-10 text-brand-muted">
          No Courses Available
        </div>
      )}
    </div>
      </div>
    </div>
  );
};

export default CoursePageContent;
