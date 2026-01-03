'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import CourseCurriculum from './CourseCurriculum';
import CourseContent from './CourseContent';
import { useGetCourseChaptersDataQuery, fetchSectionsData } from '@/framework/basic-rest/university/dashboardApi';
import LoadingComp from '../common/loading';
import { toast } from 'react-toastify';

interface CourseLMSModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

export default function CourseLMSModal({
  isOpen,
  onClose,
  courseId,
  courseName,
}: CourseLMSModalProps) {
  const [sectionData, setSectionData] = useState<any>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [sectionsIsLoading, setSectionsIsLoading] = useState<boolean>(false);

  const {
    data: chapters,
    isLoading: chapterIsLoading,
    refetch: refetchSectionData,
    error: chapterError,
  } = useGetCourseChaptersDataQuery(courseId);

  // Reset state and refetch when modal opens with new courseId
  useEffect(() => {
    if (isOpen) {
      setSectionData(null);
      setSelectedSectionId(null);
      refetchSectionData();
    }
  }, [isOpen, courseId, refetchSectionData]);

  // helper to fetch currently selected section and update state
  const fetchAndSetSection = async (section: any) => {
    try {
        setSectionsIsLoading(true);
      const sectionId = section?._id;
      setSelectedSectionId(sectionId || null);
      if (!courseId || !sectionId) {
        setSectionData(null);
        return null;
      }
      const res = await fetchSectionsData(courseId, sectionId);
    console.log("fetchSectionsData",res)
      if (res?.success === false) {
      toast.error(res?.message || 'Something went wrong');
      setSectionData(null);
      return null;
    }
      setSectionData(res?.data || res);
      return res;
    } catch (err:any) {
      toast.error(err?.message || 'Failed to fetch section');
      setSectionData(null);
      return null;
    }finally {
        setSectionsIsLoading(false);
      }
  };

  // refetch selected section (used by CourseContent after progress/reactions)
  const refetchSelectedSection = async () => {
    if (!courseId || !selectedSectionId) return null;
    try {
        setSectionsIsLoading(true);
      const res = await fetchSectionsData(courseId, selectedSectionId);
      console.log("refetchSelectedSection",res)
      if (res?.success === false) {
      toast.error(res?.message || 'Something went wrong');
      setSectionData(null);
      return null;
    }

      setSectionData(res?.data || res);
      return res;
    } catch (err) {
      toast.error('Something went wrong while updating progress');
    }finally {
        setSectionsIsLoading(false);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl w-[95vw] h-[90vh] max-w-[80vw] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-brand-blue">{courseName}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar - Curriculum */}
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto">
            {
             chapterIsLoading ? (
            <div className='w-full flex justify-center items-center h-[600px]'>
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
            <div className='w-full flex justify-center items-center h-[600px]'>
            <LoadingComp />
            </div> 
            ) 
            : sectionData ?  (
              <CourseContent
                sectionData={sectionData}
                refetchSectionData={refetchSelectedSection}
                refetchChapters={refetchSectionData}
                courseId={courseId}
                sectionsIsLoading={sectionsIsLoading}
              />
            )
            : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>Select a chapter to view content</p>
              </div>
            )
            }
          </div>
        </div>
      </div>
    </div>
  );
}
