import { Metadata } from 'next';
import Container from '@/components/ui/container';
import CheckoutPageContent from './checkout-page-content';

export const metadata: Metadata = {
  title: 'Checkout',
};

export default async function CheckoutPage({
  params: { lang },
}: {
  params: {
    lang: string;
  };
}) {
  return (
    <Container>
      <CheckoutPageContent />
    </Container>
  );
}
