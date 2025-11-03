import React from 'react';
import CourseCard from './course-card';
import Link from 'next/link';

const RecentlyViewed = ({
  lang,
  recentCourses,
}: {
  lang: string;
  recentCourses?: any;
}) => {
  //   console.log(lang, '====>>> lang');
  return (
    <div className="my-10">
      <h1 className="text-3xl text-black font-bold">Recently Viewed</h1>
      <div
        id="cardContainer"
        className="my-5 flex items-center justify-center md:justify-start gap-4 flex-wrap"
      >
        {[1, 2, 3].map((item) => {
          return (
            <Link
              href={`/${lang}/valliani-university/${item}`}
              className=""
              key={item}
            >
              <CourseCard />
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default RecentlyViewed;
