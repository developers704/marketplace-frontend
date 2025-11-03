'use client';
import React, { useEffect, useState } from 'react';
import CourseCard from './course-card';
import Link from 'next/link';
import {
  useGetAllCoursesQuery,
} from '@/framework/basic-rest/courses/get-all-courses';

const CoursesMain = ({ lang }: { lang: string }) => {
  const { data: courses, isLoading, isError } = useGetAllCoursesQuery();

  // console.log(courses, '===>>> courses from query');

  if (isLoading) {
    return <div>Loading...</div>; // Show a loading spinner or placeholder
  }

  if (isError) {
    return <div>Error loading courses.</div>; // Show error message if the query fails
  }

  return (
    <div className="my-10">
      <h1 className="text-3xl text-black font-bold">Courses</h1>
      <div
        id="cardContainer"
        className="my-5 flex items-center gap-4 flex-wrap justify-center md:justify-start"
      >
        {courses?.map((course: any) => {
          return (
            <Link
              href={`/${lang}/valliani-university/${course.name}/${course._id}`}
              className=""
              key={course._id}
            >
              <CourseCard data={course} />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default CoursesMain;
