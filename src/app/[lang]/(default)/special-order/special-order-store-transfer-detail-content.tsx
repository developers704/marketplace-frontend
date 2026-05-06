'use client';

import React, { useState } from 'react';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import SpecialOrderSidebarTabs from './special-order-sidebar-tabs';
import StoreTransferDetailContent from '../store-transfer/store-transfer-detail-content';

export default function SpecialOrderStoreTransferDetailContent({
  lang,
  orderId,
}: {
  lang: string;
  orderId: string;
}) {
  const [storeRefresh, setStoreRefresh] = useState(0);

  return (
    <Container>
      <Breadcrumb lang={lang} />
      <section className="my-6 md:my-10 lg:my-12 w-full">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <aside className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-80 xl:w-96 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <SpecialOrderSidebarTabs
              lang={lang}
              storeRefreshTrigger={storeRefresh}
            />
          </aside>
          <div className="min-w-0 flex-1">
            <StoreTransferDetailContent
              lang={lang}
              orderId={orderId}
              embedded
              onOrderUpdated={() => setStoreRefresh((n) => n + 1)}
            />
          </div>
        </div>
      </section>
    </Container>
  );
}
