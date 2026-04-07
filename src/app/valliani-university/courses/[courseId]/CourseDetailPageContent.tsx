'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { useGetCourseChaptersDataQuery } from '@/framework/basic-rest/university/dashboardApi';
import { useGetCourseQuery } from '@/framework/basic-rest/courses/get-course-by-id';
import LoadingComp from '@/components/common/loading';
import ChapterCard from '@/components/university/ChapterCard';

export default function CourseDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  const [courseName, setCourseName] = useState<string>('');

  const {
    data: chaptersData,
    isLoading: chapterIsLoading,
  } = useGetCourseChaptersDataQuery(courseId);

  const { data: courseData } = useGetCourseQuery(courseId);

  const chapters = chaptersData?.data?.chapters ?? [];

  useEffect(() => {
    if (courseData?.data?.name) {
      setCourseName(courseData.data.name);
    } else if (courseData?.name) {
      setCourseName(courseData.name);
    } else if (chaptersData?.data?.courseName) {
      setCourseName(chaptersData.data.courseName);
    }
  }, [courseData, chaptersData]);

  const handleBackClick = () => {
    if (courseData?.data?.courseType === 'Short Course' || courseData?.courseType === 'Short Course') {
      router.push('/valliani-university/tasks');
    } else {
      router.push('/valliani-university/courses');
    }
  };

  return (
    <div className="w-full flex flex-col min-h-[calc(100vh-110px)] bg-gray-50">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white flex-shrink-0">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBackClick}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition px-4 py-2 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Courses</span>
          </button>
        </div>
        <h2 className="text-2xl font-bold text-brand-blue">{courseName || 'Course'}</h2>
        <div />
      </div>

      <div className="flex-1 p-6 md:p-8">
        {chapterIsLoading ? (
          <div className="w-full flex justify-center items-center min-h-[400px]">
            <LoadingComp />
          </div>
        ) : chapters.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
            <p>No chapters available for this course.</p>
          </div>
        ) : (
          <>
            <p className="text-neutral-600 mb-6">Select a chapter to view its content.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {chapters.map((chapter: any, index: number) => (
                <ChapterCard
                  key={chapter._id}
                  chapter={chapter}
                  index={index}
                  courseId={courseId}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
