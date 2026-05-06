import { Metadata } from 'next';
import { Suspense } from 'react';
import SpecialOrderStoreTransferDetailContent from '../../special-order-store-transfer-detail-content';

export const metadata: Metadata = {
  title: 'Store transfer request',
};

export default async function Page({
  params,
}: {
  params: { lang: string; orderId: string };
}) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-600">Loading…</div>}>
      <SpecialOrderStoreTransferDetailContent lang={params.lang} orderId={params.orderId} />
    </Suspense>
  );
}
