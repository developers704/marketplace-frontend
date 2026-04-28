'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { getMySpecialOrders, spoStatusLabel, type SpecialOrder } from '@/framework/basic-rest/spo/spo';
import { Package } from 'lucide-react';

const FILTERS = [
  { id: 1, title: 'All', value: 'all' },
  { id: 2, title: 'Submitted', value: 'SUBMITTED' },
  { id: 3, title: 'Received', value: 'RECEIVED_BY_SPO_TEAM' },
  { id: 4, title: 'WIP', value: 'WIP' },
  { id: 5, title: 'Completed', value: 'COMPLETED' },
  { id: 6, title: 'Delivered', value: 'CLOSED' },
  { id: 7, title: 'Finalized', value: 'FINALIZED' },
];

const ALLOWED_STATUSES = new Set([
  'SUBMITTED',
  'RECEIVED_BY_SPO_TEAM',
  'WIP',
  'COMPLETED',
  'CLOSED',
  'FINALIZED',
]);

type Props = {
  lang: string;
};

const B2BMySpoOrders = ({ lang }: Props) => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState<SpecialOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const data = await getMySpecialOrders();
        if (!cancelled) setOrders(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setOrders([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const visibleOrders = useMemo(
    () => orders.filter((o) => ALLOWED_STATUSES.has(o.status)),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    if (selectedFilter === 'all') return visibleOrders;
    return visibleOrders.filter((o) => o.status === selectedFilter);
  }, [selectedFilter, visibleOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          SPO Orders
        </h1>
        <p className="mt-1 text-slate-600">
          Track your special orders. Click any order to open full details and chat.
        </p>
      </div>
      

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {FILTERS?.map((item) => {
          const isSelected = selectedFilter === item.value;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedFilter(item.value)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {item?.title}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((row) => (
            <div key={row} className="h-20 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16">
          <Package className="h-16 w-16 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-600">No SPO orders found</p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedFilter === 'all'
              ? 'Your special orders will appear here after you submit them'
              : `No orders with status "${spoStatusLabel(selectedFilter)}"`}
          </p>
        </div>
      ) : (
       <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {filteredOrders?.map((order) => (
    <li key={order?._id}>
      <Link
        href={`/${lang}/special-order/${order?._id}`}
        // href={`/marketplace`}
        className="block rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-lg hover:border-slate-300"
      >
        {/* TOP */}
        <div className="flex items-center justify-between mb-3">
          <span className="font-semibold text-slate-900">
            {order?.ticketNumber}
          </span>

          <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
            {spoStatusLabel(order?.status)}
          </span>
        </div>

        {/* DETAILS */}
        <div className="space-y-1 text-sm text-slate-600">
          <p><strong>SKU:</strong> {order?.referenceSkuNumber}</p>
          <p><strong>Customer:</strong> {order?.customerNumber}</p>
          <p><strong>Metal:</strong> {order?.metalQuality}</p>
        </div>

        {/* OPTIONAL */}
        {(order?.customization || order?.diamondDetails) && (
          <div className="mt-2 text-xs text-slate-500">
            {order?.customization && <p>Custom: {order.customization}</p>}
            {order?.diamondDetails && <p>Diamond: {order.diamondDetails}</p>}
          </div>
        )}

        {/* FOOTER */}
        <p className="mt-3 text-xs text-slate-400">
          {typeof order.storeId === 'object' && order.storeId?.name
            ? order.storeId.name
            : 'Store'}
        </p>
      </Link>
    </li>
  ))}
</ul>
      )}
    </div>
  );
};

export default B2BMySpoOrders;
