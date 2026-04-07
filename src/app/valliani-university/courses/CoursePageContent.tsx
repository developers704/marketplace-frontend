'use client';
import { CourseCardSkeletons } from '@/components/ui/skeletons';
import CourseCard2 from '@/components/university/CourseCard2';
import ChapterCard from '@/components/university/ChapterCard';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetCustomerCoursesQuery, useGetCourseChaptersDataQuery } from '@/framework/basic-rest/university/dashboardApi';
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

import LoadingComp from '@/components/common/loading';
import { useRouter } from 'next/navigation';

const CoursePageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdFromUrl = searchParams.get('course');

  const [selectedCourse, setSelectedCourse] = useState<{ _id: string; name?: string } | null>(null);

  const {
    data: userCourses,
    isLoading: courseIsLoading,
  } = useGetCustomerCoursesQuery();

  const { data: chaptersData, isLoading: chapterIsLoading } = useGetCourseChaptersDataQuery(
    selectedCourse?._id ?? ''
  );

  const chapters = chaptersData?.data?.chapters ?? [];

  // When URL has ?course=id, select that course so chapter cards show below (e.g. after redirect from /courses/[courseId])
  useEffect(() => {
    if (!courseIdFromUrl || !userCourses?.data) return;
    const course = userCourses.data.find((c: any) => c._id === courseIdFromUrl);
    if (course?.canAccess) {
      setSelectedCourse({ _id: course._id, name: course.name });
    }
  }, [courseIdFromUrl, userCourses?.data]);

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
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-[#6f4e37]">
          Courses
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>

      {/* Course cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
        {courseIsLoading ? (
          Array.from({ length: 6 }).map((_, index) => (
            <CourseCardSkeletons key={index} />
          ))
        ) : userCourses?.data?.length > 0 ? (
          userCourses?.data
            ?.filter((course: any) => course?.courseType === 'Course')
            ?.map((course: any) => (
              <CourseCard2
                key={course?._id}
                data={course}
                onCourseSelect={(courseData: any) => setSelectedCourse(courseData)}
              />
            ))
        ) : (
          <div className="col-span-full flex justify-center items-center py-10 text-brand-muted">
            No Courses Available
          </div>
        )}
      </div>

      {/* Chapter cards - same page, below course cards (when a course is selected) */}
      {selectedCourse && (
        <div className="mt-10 pt-8 border-t border-gray-200">
          <div className="flex items-center gap-4 mb-6">
            {/* <button
              type="button"
              onClick={() => {
                setSelectedCourse(null);
                router.replace('/valliani-university/courses');
              }}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back</span>
            </button> */}
            <h2 className="text-xl font-bold text-[#6f4e37]">
             {selectedCourse?.name || '-'}
            </h2>
          </div>
          {chapterIsLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <LoadingComp />
            </div>
          ) : chapters.length === 0 ? (
            <div className="py-10 text-center text-gray-500">
              No chapters available for this course.
            </div>
          ) : (
            <>
              {/* <p className="text-neutral-600 mb-4">Select a chapter to view its content.</p> */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-6 ">
                {chapters.map((chapter: any, index: number) => (
                  <ChapterCard
                    key={chapter._id}
                    chapter={chapter}
                    index={index}
                    courseId={selectedCourse._id}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CoursePageContent;
