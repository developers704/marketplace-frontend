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
} from '@/framework/basic-rest/university/dashboardApi';
import { useEffect, useRef, useState } from 'react';

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

  // console.log(userCourses, 'userCourses');
  // console.log(graphData, 'graphData');
  useEffect(() => {
    if (period) {
      refetchGraphData(); // jab bhi period change ho, force refetch
    }
  }, [period, refetchGraphData]);

  return (
    <div className="">
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          Welcome To University Dashboard
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
                    icon="/icons/statIcon1.svg"
                    label="Average Percentage"
                    value={`${Number(graphData?.data?.averageScore)}%`}
                  />
                  <StatCard
                    icon="/icons/statIcon1.svg"
                    label="Completed Course"
                    value={Number(graphData?.data?.completedCourses)}
                  />
                  <StatCard
                    icon="/icons/statIcon1.svg"
                    label="Grade Scale"
                    value="90% + = A"
                  />
                </>
              )}
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm ">
            <div className="mb-3 text-[22px] font-bold">My Courses</div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courseIsLoading ? (
                [1, 2, 3].map((_, index) => (
                  <>
                    <SingleCardSkeletons key={index} />
                  </>
                ))
              ) : userCourses?.data.length > 0 ? (
                userCourses?.data
                  ?.slice(0, 3)
                  ?.map((course: any) => (
                    <CourseCard key={course._id} data={course} />
                  ))
              ) : (
                <div className="text-center text-brand-muted">
                  No Courses Available
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
