'use client';
import { SkeletonLoaderTable } from '@/components/ui/skeletons';
import Certificate from '@/components/university/Certificate';
import CourseHistoryTable from '@/components/university/course-history-table';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetCourseProgressQuery } from '@/framework/basic-rest/university/dashboardApi';
import React from 'react';
import { Award, BookOpen, GraduationCap, TrendingUp, ShieldCheck } from 'lucide-react';

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
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-brand-blue/10 rounded-lg">
            <Award className="w-6 h-6 text-brand-blue" />
          </div>
          <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
            Achievements
          </h1>
        </div>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>

      {/* Program Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Overall Program %"
          value={`${data?.data?.summary?.programStats?.percentage ?? 0}%`}
          sub="Average across all main courses"
          icon={<TrendingUp className="w-5 h-5 text-brand-blue" />}
        />
        <SummaryCard
          title="Main Courses Completed"
          value={`${data?.data?.summary?.completedCourses ?? 0} / ${data?.data?.summary?.mainCoursesCount ?? 0}`}
          sub="Must complete all main courses"
          icon={<GraduationCap className="w-5 h-5 text-emerald-600" />}
        />
        <SummaryCard
          title="Certificate Ready?"
          value={
            data?.data?.summary?.programStats?.eligibleForCertificate
              ? 'Eligible'
              : data?.data?.summary?.programStats?.requiresShortCourses
              ? 'Needs Short Course'
              : 'Not Eligible'
          }
          sub="Eligibility requires 70%+ overall"
          icon={<ShieldCheck className="w-5 h-5 text-indigo-600" />}
        />
        <SummaryCard
          title="Quizzes"
          value={`${data?.data?.summary?.programStats?.totalQuizzes ?? 0} total`}
          sub={`Anchor: ${data?.data?.summary?.programStats?.anchorCourseId ? 'Set' : 'Unset'}`}
          icon={<BookOpen className="w-5 h-5 text-amber-600" />}
        />
      </div>

      {/* Grading System Info Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          {/* <div className="p-3 bg-brand-blue/10 rounded-lg flex-shrink-0">
            <Info className="w-5 h-5 text-brand-blue" />
          </div> */}
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Grading System & Certification Criteria
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className=" flex items-center gap-4 mb-2 ">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-700 font-bold text-sm">A</span>
                  </div>
                  <div>

                  <span className="font-semibold text-gray-900 ">Grade A</span>
                  <p className="text-sm text-gray-800  flex justify-center">90% and above</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-700 font-bold text-sm">B</span>
                  </div>
                  <div>

                  <span className="font-semibold text-gray-900">Grade B</span>
                  <p className="text-sm text-gray-800">80% - 89%</p>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-4 mb-2">
                  <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                    <span className="text-yellow-700 font-bold text-sm">C</span>
                  </div>
                  <div>

                  <span className="font-semibold text-gray-900">Grade C</span>
                  <p className="text-sm text-gray-800">70% - 79%</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white/70 rounded-lg p-4 border border-blue-200">
              <p className="text-sm text-gray-700 leading-relaxed">
                <span className="font-semibold text-brand-blue">Passing Criteria:</span>{' '}
                A minimum score of 70% is required to pass and proceed to the next level. 
                Students scoring below 70% will need to complete short courses to improve their understanding 
                before attempting the main course again.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Courses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-brand-blue to-blue-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Main Courses</h2>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <SkeletonLoaderTable />
          ) : (
            <CourseHistoryTable
              data={data?.data?.mainCourses}
              summary={data?.data?.summary}
            />
          )}
        </div>
      </div>

      {/* Short Courses Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-600 px-6 py-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-5 h-5 text-white" />
            <h2 className="text-xl font-bold text-white">Short Courses</h2>
          </div>
        </div>
        <div className="p-6">
          {isLoading ? (
            <SkeletonLoaderTable />
          ) : (
            <CourseHistoryTable
              data={data?.data?.shortCourses}
              summary={data?.data?.summary}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AchievementPageContent;

const SummaryCard = ({
  title,
  value,
  sub,
  icon,
}: {
  title: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
}) => (
  <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-3">
    <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
    <div className="flex-1">
      <div className="text-sm text-gray-500 font-medium">{title}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
      {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
    </div>
  </div>
);
