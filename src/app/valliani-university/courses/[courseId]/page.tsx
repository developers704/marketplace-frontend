import { Metadata } from 'next';
import CourseDetailPageContent from './CourseDetailPageContent';

export const metadata: Metadata = {
  title: 'Course Details',
};

export default function Page() {
  return (
    <>
      <CourseDetailPageContent />
    </>
  );
}

