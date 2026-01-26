'use client';

import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import CourseCurriculum from '@/components/university/CourseCurriculum';
import CourseContent from '@/components/university/CourseContent';
import { useGetCourseChaptersDataQuery, fetchSectionsData } from '@/framework/basic-rest/university/dashboardApi';
import { useGetCourseQuery } from '@/framework/basic-rest/courses/get-course-by-id';
import LoadingComp from '@/components/common/loading';
import { toast } from 'react-toastify';

export default function CourseDetailPageContent() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;
  
  const [sectionData, setSectionData] = useState<any>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionsIsLoading, setSectionsIsLoading] = useState<boolean>(false);
  const [courseName, setCourseName] = useState<string>('');
  const [autoLoaded, setAutoLoaded] = useState(false);
 
  const {
    data: chapters,
    isLoading: chapterIsLoading,
    refetch: refetchSectionData,
    error: chapterError,
  } = useGetCourseChaptersDataQuery(courseId);

  const {
    data: courseData,
    isLoading: courseDataLoading,
  } = useGetCourseQuery(courseId);

  

  // Set course name from course data or chapters data
  useEffect(() => {
  if (
    !autoLoaded &&
    chapters?.data?.chapters?.length > 0
  ) {
    const firstChapter = chapters.data.chapters[0];
    const firstSection = firstChapter?.sections?.[0];

    if (firstSection) {
      fetchAndSetSection(firstSection);
      setAutoLoaded(true);
    }
  }
}, [chapters, autoLoaded]);

  useEffect(() => {
    if (courseData?.data?.name) {
      setCourseName(courseData.data.name);
    } else if (courseData?.name) {
      setCourseName(courseData.name);
    } else if (chapters?.data?.courseName) {
      setCourseName(chapters.data.courseName);
    }
  }, [courseData, chapters]);

  // Reset state when courseId changes
  useEffect(() => {
    if (courseId) {
      setSectionData(null);
      setSelectedSectionId(null);
      refetchSectionData();
    }
  }, [courseId, refetchSectionData]);

  // helper to fetch currently selected section and update state
  const fetchAndSetSection = async (section: any) => {
    try {
      setSectionsIsLoading(true);
      // Supports both normal sections (_id is string) and quiz items (_id can be string or populated object)
      const sectionId = section?.isQuiz
        ? (section?._id?._id ?? section?._id)
        : section?._id;
      
      console.log("fetchAndSetSection sectionId", sectionId, section);
      setSelectedSectionId(sectionId || null);
      if (!courseId || !sectionId) {
        setSectionData(null);
        return null;
      }
      const res = await fetchSectionsData(courseId, sectionId);
      if (res?.success === false) {
            toast.error(res?.message || 'Something went wrong');
            setSectionData(null);
            return null;
          }
      setSectionData(res?.data || res);
      return res;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch section data';
      toast.error(errorMessage);
      setSectionData(null);
      return null;
    } finally {
      setSectionsIsLoading(false);
    }
  };

  // refetch selected section (used by CourseContent after progress/reactions)
  const refetchSelectedSection = async () => {
    if (!courseId || !selectedSectionId) return null;
    try {
      setSectionsIsLoading(true);
      const res = await fetchSectionsData(courseId, selectedSectionId);
      console.log("refetchSelectedSection", res);
      
      if (res?.success === false) {
            toast.error(res?.message || 'Something went wrong');
            setSectionData(null);
            return null;
          }
      setSectionData(res?.data || res);
      return res;
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch section data';
      toast.error(errorMessage);
      setSectionData(null);
      return null;
    } finally {
      setSectionsIsLoading(false);
    }
  };

  const handleBackClick = () => {
    if(courseData?.courseType == "Short Course"){
      router.push('/valliani-university/tasks');
    }else{
      router.push('/valliani-university/courses');
    }
  };

  return (
    <div className="w-full flex flex-col bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 110px)' }}>
      {/* Header with Back Button */}
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
        <div></div>
      </div>

      {/* Content Area */}
      <div className="flex flex-1 overflow-hidden bg-gray-50">
        {/* Left Sidebar - Curriculum */}
        <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
          {chapterIsLoading ? (
            <div className="w-full flex justify-center items-center h-[600px]">
              <LoadingComp />
            </div>
          ) : chapters ? (
            <div className="p-4">
              <CourseCurriculum
                chapterIsLoading={chapterIsLoading}
                data={chapters?.data?.chapters}
                onSectionSelect={async (section: any) => {
                  await fetchAndSetSection(section);
                }}
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>No chapter Available</p>
            </div>
          )}
        </div>

        {/* Right Side - Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          {sectionsIsLoading ? (
            <div className="w-full flex justify-center items-center h-[600px]">
              <LoadingComp />
            </div>
          ) : sectionData ? (
            <CourseContent
              sectionData={sectionData}
              refetchSectionData={refetchSelectedSection}
              refetchChapters={refetchSectionData}
              courseId={courseId}
              sectionsIsLoading={sectionsIsLoading}
              onNavigate={fetchAndSetSection}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <p>Select a chapter to view content</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

