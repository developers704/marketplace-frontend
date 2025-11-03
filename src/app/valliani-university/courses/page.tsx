import { Metadata } from 'next';
import CoursePageContent from './CoursePageContent';
export const metadata: Metadata = {
  title: 'Your Courses',
};

export default function Page() {
  return (
    <>
      <CoursePageContent />
    </>
  );
}
