'use client';

import { useRouter, useParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Course detail URL redirects to courses page with course selected,
 * so chapter cards show below course cards on the same page.
 */
export default function CourseDetailRedirect() {
  const router = useRouter();
  const params = useParams();
  const courseId = params?.courseId as string;

  useEffect(() => {
    if (courseId) {
      router.replace(`/valliani-university/courses?course=${courseId}`);
    } else {
      router.replace('/valliani-university/courses');
    }
  }, [courseId, router]);

  return null;
}

