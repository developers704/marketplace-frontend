import { Metadata } from 'next';
import SpecialOrderDetailContent from '../special-order-detail-content';

export const metadata: Metadata = {
  title: 'SPO Order',
};

export default async function Page({
  params,
}: {
  params: { lang: string; orderId: string };
}) {
  return (
    <SpecialOrderDetailContent lang={params.lang} orderId={params.orderId} />
  );
}
