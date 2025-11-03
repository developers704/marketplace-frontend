'use client';
import CourseContent from '@/components/university/CourseContent';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetSectionsDataQuery } from '@/framework/basic-rest/university/dashboardApi';
import { useParams } from 'next/navigation';
import React from 'react';

const ContentPage = () => {
  const params = useParams();
  // console.log(params, 'params');
  const {
    data: sectionsData,
    isLoading: sectionsIsLoading,
    error: sectionsError,
    refetch: sectionsRefetch,
  } = useGetSectionsDataQuery(
    params?.chapterId.toString(),
    params?.sectionId.toString(),
  );
  console.log(sectionsData, 'sectionsData');
  return (
    <div>
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          Content
        </h1>
        <SearchBar onSearch={(query) => console.log('Searching for:', query)} />
      </div>
      <div>
        <CourseContent
          sectionData={sectionsData?.data}
          refetchSectionData={sectionsRefetch}
        />
      </div>
    </div>
  );
};

export default ContentPage;
