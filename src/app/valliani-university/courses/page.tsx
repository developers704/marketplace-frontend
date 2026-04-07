import { Metadata } from 'next';
import { Suspense } from "react";
import CoursePageContent from './CoursePageContent';
import UniversityPrivacyModal from '@/components/common/modal/UniversityPrivacyModal';
export const metadata: Metadata = {
  title: 'Your Courses',
};

export default function Page() {
  return (
    <>
      <UniversityPrivacyModal />
      <Suspense fallback={<div>Loading...</div>}>
        <CoursePageContent />
      </Suspense>
    </>
  );
}
