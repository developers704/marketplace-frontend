// import React from 'react';
'use client';
import {
  SingleCardSkeletons,
  StatCardSkeleton,
} from '@/components/ui/skeletons';
import CourseCard from '@/components/university/course-card';
import InfoBox from '@/components/university/InfoBox';
import { WeeklyProgressChart } from '@/components/university/ProgressBarChart';
import { StatCard } from '@/components/university/StatCard';
import SearchBar from '@/components/university/UniversitySearchBar';
import {
  useGetCustomerCoursesQuery,
  useGetGraphDataQuery,
  useGetShortCoursesQuery,
} from '@/framework/basic-rest/university/dashboardApi';
import { useEffect, useRef, useState } from 'react';
import { CheckCircle, GraduationCap, Percent } from 'lucide-react';

const Dashboard = () => {
  const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const {
    data: userCourses,
    isLoading: courseIsLoading,
    error: courseError,
  } = useGetCustomerCoursesQuery();

  const {
    data: graphData,
    isLoading: graphDataIsLoading,
    error: graphDataError,
    refetch: refetchGraphData,
  } = useGetGraphDataQuery(period);

  const {
    data: shortCoursesData,
    isLoading: shortCoursesLoading,
    error: shortCoursesError,
  }=useGetShortCoursesQuery();

  // console.log(userCourses, 'userCourses');
  // console.log(graphData, 'graphData');
  useEffect(() => {
    if (period) {
      refetchGraphData(); // jab bhi period change ho, force refetch
    }
  }, [period, refetchGraphData]);

  const courses = userCourses?.data || [];
  const mainCourses = courses.filter((c: any) => c?.courseType !== 'Short Course');
  const shortCourses = shortCoursesData?.data?.shortCourses || [];
 


  return (
    <div className="">
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          Welcome 
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          // fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div className="flex gap-5 flex-col md:flex-row">
        <div className="flex-[2]">
          <div className="flex gap-4 mb-6 flex-col lg:flex-row">
            <div className="flex-[2]">
              <WeeklyProgressChart
                graphData={graphData?.data?.graphData}
                isLoading={graphDataIsLoading}
                selectedPeriod={period}
                setSelectedPeriod={setPeriod}
              />
            </div>
            <div className="flex-[1] flex flex-col justify-between">
              {graphDataIsLoading ? (
                [1, 2, 3].map((_, index) => <StatCardSkeleton key={index} />)
              ) : (
                <>
                  <StatCard
                    Icon={Percent}
                    label="Average Percentage"
                    value={`${Number(graphData?.data?.averageScore)}%`}
                  />
                  <StatCard
                    Icon={GraduationCap}
                    label="Completed Course"
                    value={Number(graphData?.data?.completedCourses)}
                  />
                  <StatCard
                    Icon={CheckCircle}
                    label="Grade Scale"
                    value="90% + = A"
                  />
                </>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm ">
            <div className="mb-3 text-[22px] font-bold">Main Courses</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseIsLoading ? (
                [1, 2, 3].map((_, index) => (
                  <SingleCardSkeletons key={index} />
                ))
              ) : mainCourses.length > 0 ? (
                mainCourses.map((course: any) => (
                  <CourseCard key={course._id} data={course} />
                ))
              ) : (
                <div className="text-center text-brand-muted">
                  No Main Courses Available
                </div>
              )}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
            <div className="mb-3 text-[22px] font-bold">Short Courses</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseIsLoading ? (
                [1, 2, 3].map((_, index) => (
                  <SingleCardSkeletons key={index} />
                ))
              ) : shortCourses.length > 0 ? (
                shortCourses.map((course: any) => (
                  <CourseCard key={course._id} data={course} />
                ))
              ) : (
                <div className="text-center text-brand-muted">
                  No Short Courses Available
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex-[1]">
          <InfoBox />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
