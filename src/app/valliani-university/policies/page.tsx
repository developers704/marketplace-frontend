import { Metadata } from 'next';
import PoliciesPageContent from './PoliciesPageContent';

export const metadata: Metadata = {
  title: 'Policies',
};

export default function Page() {
  return (
    <>
      <PoliciesPageContent />
    </>
  );
}
