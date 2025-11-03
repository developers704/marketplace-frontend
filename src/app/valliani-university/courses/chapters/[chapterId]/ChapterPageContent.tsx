'use client';
import CourseCurriculum from '@/components/university/CourseCurriculum';
import SearchBar from '@/components/university/UniversitySearchBar';
import { useGetCourseChaptersDataQuery } from '@/framework/basic-rest/university/dashboardApi';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';

const ChapterPageContent = () => {
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const params = useParams();
  // console.log(params?.chapterId, '===>>> params');
  const handleTopicClick = (topic: string) => {
    setSelectedTopic(topic);
  };

  const {
    data: chapters,
    isLoading: chapterIsLoading,
    error: chapterError,
  } = useGetCourseChaptersDataQuery(params?.chapterId);

  // console.log(chapters, 'chapters');

  return (
    <div>
      <div>
        <div className="flex justify-between items-center pb-6">
          <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
            Chapters
          </h1>
          <SearchBar
            onSearch={(query) => console.log('Searching for:', query)}
          />
        </div>
        <div>
          {!chapters?.success ? (
            <>
              <div>{chapters?.message}</div>
            </>
          ) : (
            <div>
              <CourseCurriculum onTopicClick={handleTopicClick} data={chapters?.data?.chapters}/>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChapterPageContent;
