'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  getMyStoreTransferOrders,
  storeTransferStatusLabel,
  type B2bStoreTransferOrder,
} from '@/framework/basic-rest/b2bStoreTransfer/b2bStoreTransfer';
import { Package } from 'lucide-react';

const GOLD_ACCENT = '#C6A87D';

const SIDEBAR_FILTER_KEYS = [
  'all',
  'SUBMITTED',
  'WIP',
  'TRANSFER',
  'APPROVED',
  'DELIVERED',
  'RECEIVED',
  'REJECTED',
] as const;

type SidebarFilter = (typeof SIDEBAR_FILTER_KEYS)[number];

const FILTER_LABELS: Record<SidebarFilter, string> = {
  all: 'All',
  SUBMITTED: 'Submitted',
  WIP: 'WIP',
  TRANSFER: 'Transfer',
  APPROVED: 'Approved',
  DELIVERED: 'Delivered',
  RECEIVED: 'Received',
  REJECTED: 'Rejected',
};

const ALLOWED_STATUSES = new Set<string>(SIDEBAR_FILTER_KEYS.filter((k) => k !== 'all'));

type Props = {
  lang: string;
  refreshTrigger?: number;
};

function formatDateTime(iso: string | undefined) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export default function StoreTransferOrdersSidebar({
  lang,
  refreshTrigger = 0,
}: Props) {
  const pathname = usePathname();
  const [orders, setOrders] = useState<B2bStoreTransferOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SidebarFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMyStoreTransferOrders();
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshTrigger]);

  const visible = orders.filter((o) => ALLOWED_STATUSES.has(String(o.status || '').toUpperCase()));
  const filtered =
    filter === 'all' ? visible : visible.filter((o) => String(o.status).toUpperCase() === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          Store to store transfers
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Open a transfer for details and chat with the team.
        </p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {SIDEBAR_FILTER_KEYS.map((key) => {
          const selected = filter === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => setFilter(key)}
              className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                selected
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {FILTER_LABELS[key]}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
          <Package className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-xs font-medium text-slate-600">No transfers</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {filtered.map((o) => {
            const href = `/${lang}/special-order/store-transfer/${o._id}`;
            const active =
              pathname === href ||
              pathname?.endsWith(`/special-order/store-transfer/${o._id}`);
            return (
              <li key={o._id}>
                <Link
                  href={href}
                  className={`block rounded-xl border bg-white p-3 shadow-sm transition-all hover:border-slate-300 hover:shadow-md ${
                    active
                      ? 'border-amber-400/90 ring-1 ring-amber-300/50'
                      : 'border-slate-200/90'
                  }`}
                >
                  <div>
                    <span
                      className="inline-block shrink-0 truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{
                        background: `${GOLD_ACCENT}22`,
                        color: '#5c4d32',
                      }}
                    >
                      {storeTransferStatusLabel(o.status)}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-900">
                      {o?.ticketNumber || o._id.slice(-8)}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    {o?.destWarehouseId?.name || 'Your store'}
                  </p>
                  <p className="mt-1 truncate text-[11px] text-slate-500">
                    {formatDateTime(o.createdAt)}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
