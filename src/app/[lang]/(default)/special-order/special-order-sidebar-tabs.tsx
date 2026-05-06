'use client';

import React from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import SpoOrdersSidebar from './spo-orders-sidebar';
import StoreTransferOrdersSidebar from './store-transfer-orders-sidebar';

type TabId = 'spo' | 'store-transfer';

type Props = {
  lang: string;
  spoRefreshTrigger?: number;
  storeRefreshTrigger?: number;
};

function sidebarTabFromPath(pathname: string | null, searchParams: URLSearchParams): TabId {
  if (!pathname) return 'spo';
  const parts = pathname.split('/').filter(Boolean);
  const i = parts.lastIndexOf('special-order');
  if (i < 0) return 'spo';

  const next = parts[i + 1];
  if (next === 'store-transfer') return 'store-transfer';

  const after = parts.slice(i + 1);
  if (after.length === 1 && after[0] !== 'sheets') {
    return 'spo';
  }

  const tab = searchParams.get('tab');
  if (tab === 'store-transfer') return 'store-transfer';
  return 'spo';
}

export default function SpecialOrderSidebarTabs({
  lang,
  spoRefreshTrigger = 0,
  storeRefreshTrigger = 0,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = sidebarTabFromPath(pathname, searchParams);

  const setTab = (tab: TabId) => {
    if (tab === 'store-transfer') {
      router.replace(`/${lang}/special-order?tab=store-transfer`);
    } else {
      router.replace(`/${lang}/special-order`);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl border border-slate-200 bg-slate-100/80 p-0.5">
        <button
          type="button"
          onClick={() => setTab('spo')}
          className={`flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide transition-colors ${
            activeTab === 'spo'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          SPO orders
        </button>
        <button
          type="button"
          onClick={() => setTab('store-transfer')}
          className={`flex-1 rounded-lg px-2 py-2 text-center text-[11px] font-bold uppercase tracking-wide transition-colors ${
            activeTab === 'store-transfer'
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Store transfers
        </button>
      </div>

      {activeTab === 'spo' ? (
        <SpoOrdersSidebar lang={lang} refreshTrigger={spoRefreshTrigger} />
      ) : (
        <StoreTransferOrdersSidebar lang={lang} refreshTrigger={storeRefreshTrigger} />
      )}
    </div>
  );
}
