import { Metadata } from 'next';
import Dashboard from './DashboardPageContent';
import UniversityPrivacyModal from '@/components/common/modal/UniversityPrivacyModal';

export const metadata: Metadata = {
  title: 'Valliani University | Dashboard',
};

export default function Page() {
  return (
    <>
      <UniversityPrivacyModal />
      <Dashboard />
    </>
  );
}
