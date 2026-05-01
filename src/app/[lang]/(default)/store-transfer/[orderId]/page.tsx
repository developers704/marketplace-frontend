import { Metadata } from 'next';
import StoreTransferDetailContent from '../store-transfer-detail-content';

export const metadata: Metadata = {
  title: 'Store transfer request',
};

export default async function Page({
  params,
}: {
  params: { lang: string; orderId: string };
}) {
  return <StoreTransferDetailContent lang={params.lang} orderId={params.orderId} />;
}
