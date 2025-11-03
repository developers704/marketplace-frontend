import { Metadata } from 'next';
import CertificatePage from './CertificatePageContent';

export const metadata: Metadata = {
  title: 'Achievements',
};

export default function Page() {
  return (
    <>
      <CertificatePage />
    </>
  );
}
