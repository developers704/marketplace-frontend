'use client';
import { SkeletonLoaderTable } from '@/components/ui/skeletons';
import Certificate from '@/components/university/Certificate';
import CourseHistoryTable from '@/components/university/course-history-table';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetCourseProgressQuery } from '@/framework/basic-rest/university/dashboardApi';
import React from 'react';

const AchievementPageContent = () => {
  const { data, isLoading, error, refetch } = useGetCourseProgressQuery();
  console.log(data, 'data progress');
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
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          Achievements
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div className="w-1/2 mb-5">
        <strong>Grades:</strong> A (90%+), B (80%+), C (70%+). Score 70% or more
        to pass and proceed. Less than 70% means you fail and can take short
        courses.
      </div>
      <div>
        <p className="font-bold text-xl">Main Courses</p>
        {isLoading ? (
          <SkeletonLoaderTable />
        ) : (
          <CourseHistoryTable data={data?.data?.mainCourses} />
        )}
      </div>
      <div>
        <p className="font-bold text-xl">Short Courses</p>
        {isLoading ? (
          <SkeletonLoaderTable />
        ) : (
          <CourseHistoryTable data={data?.data?.shortCourses} />
        )}
      </div>
      {/* <div>
        <p className="font-bold text-xl">Short Courses</p>
        {isLoading ? <SkeletonLoaderTable /> : <Certificate />}
      </div> */}
    </div>
  );
};

export default AchievementPageContent;
