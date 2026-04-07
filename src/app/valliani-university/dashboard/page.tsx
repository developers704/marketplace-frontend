import { Metadata } from 'next';
import Dashboard from './DashboardPageContent';

export const metadata: Metadata = {
  title: 'Valliani University | Dashboard',
};

export default function Page() {
  return <Dashboard />;
}
