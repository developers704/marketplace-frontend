'use client';
import CourseCard2 from '@/components/university/CourseCard2';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetShortCoursesQuery } from '@/framework/basic-rest/university/dashboardApi';
import React from 'react';

const TaskPageContent = () => {
  const {
    data: shortCourse,
    isLoading,
    error,
    refetch,
  } = useGetShortCoursesQuery();
  console.log(shortCourse, 'shortCourse');

  if (isLoading) return <p>Loading...</p>;
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
          Short Courses
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div>
        <h1 className="text-[28px] font-bold">Courses</h1>
        {shortCourse?.data?.length <= 0 ? (
          <>
            <p className="text-center w-full font-semibold text-gray-600 text-2xl">
              {shortCourse?.message}
            </p>
          </>
        ) : (
          shortCourse?.data?.shortCourses?.map((item: any, index: number) => {
            return (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                <div key={`${item}-${index}`} className="mb-4">
                  <CourseCard2 data={item} />
                </div>
              </div>
            );
          })
        )}
        {/* {[1, 2, 3, 4, 5, 6, 7, 8]?.map((item, index) => {
            return (
              <div key={`${item}-${index}`} className="mb-4">
                <CourseCard2 />
              </div>
            );
          })} */}
      </div>
    </div>
  );
};

export default TaskPageContent;
