'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getMySpecialOrders, spoStatusLabel, type SpecialOrder } from '@/framework/basic-rest/spo/spo';
import { Package } from 'lucide-react';
import dayjs from 'dayjs';

const GOLD_ACCENT = '#C6A87D';

const SIDEBAR_FILTER_KEYS = [
  'all',
  'SUBMITTED',
  'RECEIVED_BY_SPO_TEAM',
  'WIP',
  // 'COMPLETED',
  'CLOSED',
  'FINALIZED',
] as const;

type SidebarFilter = (typeof SIDEBAR_FILTER_KEYS)[number];

const FILTER_LABELS: Record<SidebarFilter, string> = {
  all: 'All',
  SUBMITTED: 'Submitted',
  RECEIVED_BY_SPO_TEAM: 'Received By Spo Team',
  WIP: 'WIP',
  // COMPLETED: 'Completed',
  CLOSED: 'Delivered',
  FINALIZED: 'Received',
};

const ALLOWED_STATUSES = new Set<string>([
  'SUBMITTED',
  'RECEIVED_BY_SPO_TEAM',
  'WIP',
  // 'COMPLETED',
  'CLOSED',
  'FINALIZED',
]);

type Props = {
  lang: string;
  refreshTrigger?: number;
};

function formatShort(iso: string) {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}
function formatDateTime(iso: string) {
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

const SpoOrdersSidebar = ({ lang, refreshTrigger = 0 }: Props) => {
  const pathname = usePathname();
  const [orders, setOrders] = useState<SpecialOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<SidebarFilter>('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMySpecialOrders();
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

  const visible = orders.filter((o) => ALLOWED_STATUSES.has(o.status));
  const filtered =
    filter === 'all' ? visible : visible.filter((o) => o.status === filter);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-800">
          My SPO orders
        </h2>
        <p className="mt-0.5 text-xs text-slate-500">
          Open an order for details and chat with the team.
        </p>
      </div>

      <div className="flex flex-wrap  gap-1.5">
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
            <div
              key={i}
              className="h-20 animate-pulse rounded-xl bg-slate-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-6 text-center">
          <Package className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2 text-xs font-medium text-slate-600">No orders</p>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {filtered.map((o) => {
            const href = `/${lang}/special-order/${o._id}`;
           
            const active = pathname === href || pathname?.endsWith(`/${o._id}`);
            return (
            <li key={o?._id}>
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
                    className="shrink-0  truncate rounded-md px-1.5 py-0.5 text-[10px] font-semibold inline-block"
                    style={{
                      background: `${GOLD_ACCENT}22`,
                      color: '#5c4d32',
                    }}
                  >
                    {spoStatusLabel(o?.status == "FINALIZED" ? "Received" : o?.status )}
                  </span>

                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-900">
                    {o?.ticketNumber}
                  </span>
                </div>
                <p className="mt-1 truncate text-[11px] text-slate-500">
                  {typeof o.storeId === 'object' && o.storeId?.name
                    ? o.storeId?.name
                    : 'Store'}
                 
                </p>
                <p className="mt-1 truncate text-[11px] text-slate-500">
                  {formatDateTime(o?.createdAt)}
                </p>
              </Link>
            </li>
          );
          })}
        </ul>
      )}
    </div>
  );
};

export default SpoOrdersSidebar;
