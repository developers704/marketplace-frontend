'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { fetchCourseChapters } from '@/framework/basic-rest/university/dashboardApi';
import LoadingComp from '@/components/common/loading';
import { useState } from 'react';

export default function ChapterRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params?.courseId as string;
  const chapterId = params?.chapterId as string;
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!courseId || !chapterId) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchCourseChapters(courseId);
        const chapters = res?.data?.chapters ?? [];
        const chapter = chapters.find((ch: any) => ch._id === chapterId);
        const firstSection = chapter?.sections?.[0];
        if (cancelled) return;
        if (firstSection?._id) {
          router.replace(`/valliani-university/courses/${courseId}/chapters/${chapterId}/${firstSection._id}`);
          return;
        }
        router.replace(`/valliani-university/courses/${courseId}`);
      } catch {
        if (!cancelled) router.replace(`/valliani-university/courses/${courseId}`);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId, chapterId, router]);

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <LoadingComp />
      </div>
    );
  }
  return null;
}
