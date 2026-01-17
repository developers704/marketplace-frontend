'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { requestCertificate } from '@/framework/basic-rest/university/dashboardApi';
import {
  FaCheckCircle,
  FaDownload,
  FaEye,
  FaLock,
  FaUnlock,
} from 'react-icons/fa';

interface CourseSection {
  id?: number;
  section?: string;
  title?: string;
  status?: any;
  weight?: string;
  grade?: string | '--';
  certificateAvailable?: boolean;
}

const getStatusIcon = (status: 'done' | 'unlock' | 'lock') => {
  switch (status) {
    case 'done':
      return <FaCheckCircle className="text-green-500 text-lg" />;
    case 'unlock':
      return <FaUnlock className="text-yellow-500 text-lg" />;
    case 'lock':
      return <FaLock className="text-gray-400 text-lg" />;
  }
};

const getStatusText = (
  status:
    | 'Completed'
    | 'Unlock'
    | 'Lock'
    | 'Not Started'
    | 'Failed'
    | 'In Progress'
    | 'Done',
) => {
  switch (status) {
    case 'Completed':
      return <span className="text-green-600">Completed</span>;
    case 'Done':
      return <span className="text-green-600">Done</span>;
    case 'In Progress':
      return <span className="text-green-600">In Progress</span>;
    case 'Unlock':
      return <span className="text-yellow-600">Unlock</span>;
    case 'Not Started':
      return <span className="text-gray-500">Lock</span>;
    case 'Lock':
      return <span className="text-gray-500">Lock</span>;
    case 'Failed':
      return <span className="text-red-500">Failed</span>;
  }
};



const courseData: CourseSection[] = [
  {
    id: 1,
    section: 'Course 1',
    title: 'Introduction to Sales & Customer Service',
    status: 'done',
    weight: '33.33%',
    grade: 'A',
    certificateAvailable: true,
  },
  {
    id: 2,
    section: 'Course 2',
    title: 'Sales Fundamentals',
    status: 'done',
    weight: '33.33%',
    grade: 'B',
    certificateAvailable: true,
  },
  {
    id: 3,
    section: 'Course 3',
    title: 'Customer Service Essentials',
    status: 'unlock',
    weight: '33.33%',
    grade: '--',
    certificateAvailable: false,
  },
  {
    id: 4,
    section: 'Course 4',
    title: 'Sales Techniques & Strategies',
    status: 'lock',
    weight: '33.33%',
    grade: '--',
    certificateAvailable: false,
  },
  {
    id: 5,
    section: 'Course 5',
    title: 'Customer Relationship Management (CRM)',
    status: 'lock',
    weight: '33.33%',
    grade: '--',
    certificateAvailable: false,
  },
];

const CourseHistoryTable = ({ data, summary }: any) => {
  // console.log(data, 'data progress table');
  const [sections, setSections] = useState<CourseSection[]>([]);
  const router = useRouter();
  useEffect(() => {
    setSections(courseData);
  }, []);

  if (!data || data?.length === 0) {
    return (
      <div className="w-full py-12 text-center">
        <div className="text-gray-500 mb-2">
          <FaUnlock className="w-12 h-12 mx-auto" />
        </div>
        <p className="text-gray-500 font-medium">No courses available</p>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full rounded-lg overflow-hidden">
        <thead className="">
          <tr className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
            <th className="text-left p-4 font-semibold">Course</th>
            <th className="text-left p-4 font-semibold">Status</th>
            <th className="text-left p-4 font-semibold">Weight</th>
            <th className="text-left p-4 font-semibold">Percentage</th>
            <th className="text-left p-4 font-semibold">Grade</th>
            <th className="text-left p-4 font-semibold">Certificate</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data?.map((section: any, index: number) => (
            <tr
              key={section._id}
              className="hover:bg-gray-50 transition-colors duration-150"
            >
              {/* Section Info */}
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-brand-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-brand-blue font-semibold text-sm">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 font-medium">
                      Course {index + 1}
                    </div>
                    <div className="text-base font-semibold text-gray-900 mt-0.5">
                      {section?.name || "-"}
                    </div>
                  </div>
                </div>
              </td>

              {/* Status */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  {getStatusIcon(
                    section?.status === 'Completed' || section?.status === 'Done'
                      ? 'done'
                      : section?.status === 'Failed'
                      ? 'lock'
                      : section?.status === 'In Progress' || section?.status === 'Unlock'
                      ? 'unlock'
                      : 'lock'
                  )}
                  <span className="font-medium">
                    {getStatusText(section?.status)}
                  </span>
                </div>
              </td>

              {/* Weight */}
              <td className="p-4">
                <span className="text-gray-700 font-medium">
                  {section?.weightage || '-'}
                </span>
              </td>

              {/* Percentage */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <span className="text-gray-900 font-semibold">
                    {section?.gradePercentage || 0}%
                  </span>
                  {section?.gradePercentage && (
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-brand-blue to-blue-600 rounded-full"
                        style={{ width: `${Math.min(section.gradePercentage, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              </td>

              {/* Grade */}
              <td className="p-4">
                {section?.gradeLabel && section?.gradeLabel !== '--' ? (
                  <span
                    className={`inline-flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm ${
                      section.gradeLabel === 'A'
                        ? 'bg-green-100 text-green-700'
                        : section.gradeLabel === 'B'
                        ? 'bg-blue-100 text-blue-700'
                        : section.gradeLabel === 'C'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {section?.gradeLabel}
                  </span>
                ) : (
                  <span className="text-gray-400 font-medium">--</span>
                )}
              </td>

              {/* Certificate / Remediation */}
              <td className="p-4">
                {summary?.programStats?.requiresShortCourses &&
                summary?.programStats?.allMainCoursesCompleted &&
                (summary?.programStats?.percentage ?? 0) < (summary?.programStats?.passingThreshold ?? 70) &&
                summary?.programStats?.anchorCourseId &&
                section?._id?.toString() === summary?.programStats?.anchorCourseId ? (
                  <button
                    className="bg-amber-500 text-white hover:bg-amber-600 text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    onClick={() => router.push('/valliani-university/tasks')}
                  >
                    Open Short Courses
                  </button>
                ) : section?.certificateInfo?.canRequest ? (
                  <button
                    className="bg-brand-blue text-white hover:bg-blue-700 text-sm font-medium px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md"
                    onClick={async () => {
                      try {
                        const res = await requestCertificate(section?._id);
                        if (res?.success) {
                          toast.success(res?.message || 'Certificate request submitted for approval');
                          router.refresh?.();
                        } else {
                          toast.error(res?.message || 'Unable to submit certificate request');
                        }
                      } catch (err: any) {
                        toast.error(err?.message || 'Unable to submit certificate request');
                      }
                    }}
                  >
                    Request Certificate
                  </button>
                ) : section?.certificateInfo?.requestStatus === 'Requested' ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></span>
                    Requested
                  </div>
                ) : section?.certificateInfo?.requestStatus === 'Approved' ? (
                  <button
                    onClick={() =>
                      router.push(
                        `/valliani-university/achievements/certificate/${section?._id}`,
                      )
                    }
                    className="flex items-center gap-2 px-3 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-sm font-medium transition-colors duration-200 border border-green-100"
                  >
                    <Image
                      src={`/icons/View.svg`}
                      alt="View Certificate"
                      width={18}
                      height={18}
                      className="object-contain cursor-pointer"
                    />
                    View Certificate
                  </button>
                ) : (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <FaLock className="w-4 h-4" />
                    <span>Not Available</span>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CourseHistoryTable;
