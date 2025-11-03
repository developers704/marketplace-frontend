import { Metadata } from 'next';
import TaskPageContent from './TaskPageContent';

export const metadata: Metadata = {
  title: 'Short Courses',
};

export default function Page() {
  return (
    <>
      <TaskPageContent />
    </>
  );
}
