import { Metadata } from 'next';
import ChapterPageContent from './ChapterPageContent';
export const metadata: Metadata = {
  title: 'Courses | Chapters',
};

export default function Page() {
  return (
    <>
      <ChapterPageContent />
    </>
  );
}
