'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
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

// const courseData: CourseSection[] = [
//   {
//     id: 1,
//     section: 'Section 1',
//     title: 'Introduction to Sales & Customer Service',
//     status: 'done',
//     weight: '33.33%',
//     grade: 'A',
//     certificateAvailable: true,
//   },
//   {
//     id: 2,
//     section: 'Section 2',
//     title: 'Sales Fundamentals',
//     status: 'done',
//     weight: '33.33%',
//     grade: 'B',
//     certificateAvailable: true,
//   },
//   {
//     id: 3,
//     section: 'Section 3',
//     title: 'Customer Service Essentials',
//     status: 'unlock',
//     weight: '33.33%',
//     grade: '--',
//     certificateAvailable: false,
//   },
//   {
//     id: 4,
//     section: 'Section 4',
//     title: 'Sales Techniques & Strategies',
//     status: 'lock',
//     weight: '33.33%',
//     grade: '--',
//     certificateAvailable: false,
//   },
//   {
//     id: 5,
//     section: 'Section 5',
//     title: 'Customer Relationship Management (CRM)',
//     status: 'lock',
//     weight: '33.33%',
//     grade: '--',
//     certificateAvailable: false,
//   },
// ];

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

const CourseHistoryTable = ({ data }: any) => {
  console.log(data, 'data progress table');
  const [sections, setSections] = useState<CourseSection[]>([]);
  const router = useRouter();
  useEffect(() => {
    setSections(courseData);
  }, []);

  return (
    <div className="w-full py-6">
      <table className="w-full rounded-lg">
        <thead className="">
          <tr className="border-b bg-[#666665CC] text-white">
            <th className="text-left p-3">Course</th>
            <th className="text-left p-3">Status</th>
            <th className="text-left p-3">Weight</th>
            <th className="text-left p-3">Percentage</th>
            <th className="text-left p-3">Grade</th>
            <th className="text-left p-3">Certificate</th>
          </tr>
        </thead>
        <tbody className="border !rounded-xl bg-white">
          {data?.map((section: any, index: number) => (
            <tr
              key={section._id}
              className="border-b hover:bg-gray-100 transition duration-200"
            >
              {/* Section Info */}
              <td className="p-3 flex items-center ">
                {/* {getStatusIcon(section.status)} */}
                <span className="ml-2">
                  <strong>Course {index + 1}:</strong> <br />
                  <span className="text-blue-600">{section?.name}</span>
                </span>
              </td>

              {/* Status */}
              <td className="p-3 font-medium">
                {getStatusText(section?.status)}
              </td>

              {/* Weight */}
              <td className="p-3">{section?.weightage}</td>

              {/* Percentage */}
              <td className="p-3">{section?.gradePercentage}%</td>

              {/* Grade */}
              <td className="p-3 font-semibold">{section?.gradeLabel}</td>

              {/* Certificate */}
              <td className="p-3">
                {section?.certificateInfo?.canRequest ? (
                  <div className="flex space-x-3 ">
                    <button
                      className="bg-brand-blue text-white hover:bg-blue-700 text-sm font-medium px-3 py-1 rounded-md"
                      onClick={() =>
                        router.push(
                          `/valliani-university/achievements/certificate/${section?._id}`,
                        )
                      }
                    >
                      Request Certificate
                    </button>
                    {/* <Image
                      src={`/icons/Download.svg`}
                      alt="download"
                      width={18}
                      height={18}
                      className="cursor-pointer"
                    />
                    <Image
                      src={`/icons/View.svg`}
                      alt="View"
                      width={20}
                      height={20}
                      className="object-contain mt-1.5 cursor-pointer"
                      onClick={() =>
                        router.push(
                          `/valliani-university/achievements/certificate`,
                        )
                      }
                      // objectFit='contain'
                    /> */}
                    {/* <FaDownload className="text-gray-600 cursor-pointer" />
                    <FaEye className="text-gray-600 cursor-pointer" /> */}
                  </div>
                ) : section?.certificateInfo?.requestStatus === 'Requested' ? (
                  <>
                    <div className="">Requested</div>
                  </>
                ) : section?.certificateInfo?.requestStatus === 'Approved' ? (
                  <>
                    <div className="flex space-x-3 ">
                      {/* <Image
                        src={`/icons/Download.svg`}
                        alt="download"
                        width={18}
                        height={18}
                        className="cursor-pointer"
                      /> */}
                      <Image
                        src={`/icons/View.svg`}
                        alt="View"
                        width={20}
                        height={20}
                        className="object-contain mt-1.5 cursor-pointer"
                        onClick={() =>
                          router.push(
                            `/valliani-university/achievements/certificate/${section?._id}`,
                          )
                        }
                        // objectFit='contain'
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex space-x-3 ">
                      <Image
                        src={`/icons/Download.svg`}
                        alt="download"
                        width={18}
                        height={18}
                        className="cursor-pointer opacity-30"
                      />
                      <Image
                        src={`/icons/View.svg`}
                        alt="View"
                        width={20}
                        height={20}
                        className="object-contain mt-1.5 cursor-pointer opacity-30"
                        // objectFit='contain'
                      />
                    </div>
                  </>
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
