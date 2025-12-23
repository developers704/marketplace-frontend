'use client';
import SearchBar from '@/components/university/UniversitySearchBar';
import { fetchAboutUs } from '@/framework/basic-rest/university/dashboardApi';
import React, { useEffect, useState } from 'react';

const AboutUsPageContent = () => {
  const [safeHTML, setSafeHTML] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  console.log('ABOUT US CONTENT RENDERED',safeHTML);

  useEffect(() => {
    const getAboutUs = async () => {
      setIsLoading(true);
      try {
        const res = await fetchAboutUs();
        console.log('ABOUT US DATA FETCHED',res);
        // Only sanitize and set HTML on the client
        if (typeof window !== 'undefined' && res && res[0]?.description) {
          // Dynamically import DOMPurify to avoid SSR issues
          const DOMPurify = (await import('dompurify')).default;
          setSafeHTML(DOMPurify.sanitize(res[0]?.description));
        } else if (res && res[0]?.description) {
          // Fallback: just set the raw HTML if not in browser (shouldn't happen)
          setSafeHTML(res[0]?.description);
        }
      } finally {
        setIsLoading(false);
      }
    };
    getAboutUs();
  }, []);
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
      <div className="flex justify-between items-center pb-6">
        <h1 className="text-xl md:text-[26px] lg:text-[32px] font-bold capitalize text-brand-blue">
          About Us
        </h1>
        <SearchBar
          onSearch={(query) => console.log('Searching for:', query)}
          fetchSuggestions={mockFetchSuggestions}
        />
      </div>
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-[20px] font-bold">About Valliani University</h1>
      
        {isLoading ? (
          // Skeleton Loader
          <div className="space-y-4 mt-6">
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse mt-6" />
            <div className="h-4 bg-gray-300 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-300 rounded w-4/5 animate-pulse" />
          </div>
        ) : (
          // Actual Content
          <section>
            <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
          </section>
        )}
      </div>
    </div>
  );
};

export default AboutUsPageContent;
