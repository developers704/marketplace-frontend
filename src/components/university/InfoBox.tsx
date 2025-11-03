import { useGetRightSidebarDataQuery } from '@/framework/basic-rest/university/dashboardApi';
import Image from 'next/image';
import Link from 'next/link';
import { InfoBoxSkeleton } from '../ui/skeletons';

interface ListItemProps {
  category?: string;
  title: string;
  date: string;
  image?: string;
}

interface SectionProps {
  title: string;
  items: ListItemProps[];
  showViewAll?: boolean;
}

function ListItem({ data }: any) {
  const BASE_API = process.env.NEXT_PUBLIC_BASE_API;
  // const dateStr = data?.createdAt;
  // const date = new Date(dateStr);

  // const options = {
  //   day: 'numeric',
  //   month: 'short',
  //   year: 'numeric',
  // };

  // const formattedDate = date.toLocaleDateString('en-US', options);
  // console.log(data, 'aaa'); // Output: "21 May 2025"
  return (
    <Link
      href={
        data?.courseType === 'Short Course'
          ? `/valliani-university/tasks`
          : `/valliani-university/courses`
      }
      className="flex items-start py-3 border-b border-gray-100 last:border-0"
    >
      {data?.thumbnail && (
        <div className="flex-shrink-0 mr-3">
          <Image
            src={`${BASE_API}/${data?.thumbnail}` || '/placeholder.svg'}
            alt=""
            width={50}
            height={50}
            className="rounded-md object-cover"
          />
        </div>
      )}
      <div className="flex-grow">
        {data?.courseType && (
          <div className="text-sm font-medium text-gray-900">
            {data?.courseType}
          </div>
        )}
        <div className="text-sm text-gray-700">{data?.courseName}</div>
      </div>
      <div className="flex-shrink-0 ml-2 text-xs text-gray-500">
        {data?.createdAt?.split('T')[0]}
      </div>
    </Link>
  );
}

function Section({ title, items, showViewAll = false }: SectionProps) {
  return (
    <div className="mb-6 last:mb-0 bg-white p-4 rounded-lg shadow-sm ">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-medium text-gray-800">{title}</h2>
        {/* {showViewAll && (
          <Link href="#" className="text-sm text-red-500 hover:underline">
            View all
          </Link>
        )} */}
      </div>
      <div className="p-3">
        {items?.length > 0 ? (
          items?.map((item: any, index: number) => (
            <ListItem key={index} data={item} />
          ))
        ) : (
          <div className="text-center text-gray-500 py-10">
            No results found
          </div>
        )}
      </div>
    </div>
  );
}

export default function InfoBox() {
  const whatsNewItems = [
    {
      category: 'Sales',
      title: 'Customer Services',
      date: '12 Sept 2022',
      image: '/assets/images/Course1.jpg',
    },
    {
      category: 'Jewelry',
      title: 'Diamond carat weight',
      date: '12 Sept 2022',
      image: '/assets/images/Course2.jpg',
    },
    {
      category: 'Sales',
      title: 'Tips to increase sales',
      date: '12 Sept 2022',
      image: '/assets/images/Course3.jpg',
    },
  ];

  const quizItems = [
    {
      title: 'The Anatomy of Diamond',
      date: '12 Sept 2022',
    },
    {
      title: 'What is Gemstones',
      date: '12 Sept 2022',
    },
    {
      title: 'What is Customer Services',
      date: '12 Sept 2022',
    },
  ];

  const nextLessonItems = [
    {
      category: 'Sales',
      title: 'Customer Services',
      date: '12 Sept 2022',
      image: '/assets/images/Course1.jpg',
    },
    {
      category: 'Jewelry',
      title: 'Diamond carat weight',
      date: '12 Sept 2022',
      image: '/assets/images/Course2.jpg',
    },
    {
      category: 'Sales',
      title: 'Tips to increase sales',
      date: '12 Sept 2022',
      image: '/assets/images/Course3.jpg',
    },
  ];

  const {
    data: sidebarData,
    isLoading: sidebarDataIsLoading,
    error: sidebarDataError,
  } = useGetRightSidebarDataQuery();
  console.log(sidebarData, 'sidebarData');

  return (
    <div className="max-w-md bg-gray-50 rounded-lg">
      {sidebarDataIsLoading ? (
        <InfoBoxSkeleton />
      ) : (
        <>
          <Section
            title="What's New"
            items={sidebarData?.data?.newCourses}
            showViewAll={true}
          />
          <Section title="Quiz" items={sidebarData?.data?.upcomingQuizzes} />
          <Section
            title="Next Lesson"
            items={sidebarData?.data?.upcomingLessons}
            showViewAll={true}
          />
        </>
      )}
    </div>
  );
}
