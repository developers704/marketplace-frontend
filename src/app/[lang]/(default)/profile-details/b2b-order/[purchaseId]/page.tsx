import { Metadata } from 'next';
import { Suspense } from 'react';
import B2BPurchaseDetailContent from '../../b2b-purchase-detail-content';

export const metadata: Metadata = {
  title: 'Inventory order detail',
};

export default async function Page({
  params,
}: {
  params: { lang: string; purchaseId: string };
}) {
  return (
    <Suspense fallback={<div className="py-16 text-center text-slate-600">Loading…</div>}>
      <B2BPurchaseDetailContent lang={params.lang} purchaseId={params.purchaseId} />
    </Suspense>
  );
}
