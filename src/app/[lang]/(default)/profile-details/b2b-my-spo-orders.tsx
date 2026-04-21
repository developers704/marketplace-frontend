'use client';

import React, { useEffect, useState } from 'react';
import SpoOrderCard from '@/components/common/spo-order-card';
import { OrderSkeleton } from '@/components/ui/skeletons';
import { getMySpecialOrders, type SpecialOrder } from '@/framework/basic-rest/spo/spo';
import { Package, CheckCircle2, Wrench, Inbox, XCircle } from 'lucide-react';

const filters = [
  { id: 1, title: 'All', value: 'all' },
  { id: 2, title: 'Submitted', value: 'SUBMITTED' },
  { id: 3, title: 'Received', value: 'RECEIVED_BY_SPO_TEAM' },
  { id: 4, title: 'WIP', value: 'WIP' },
  { id: 5, title: 'Completed', value: 'COMPLETED' },
  { id: 6, title: 'Closed', value: 'CLOSED' },
];

const B2BMySpoOrders = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState<SpecialOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpoOrders = async () => {
    setIsLoading(true);
    try {
      const data = await getMySpecialOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpoOrders();
  }, []);

  const filteredOrders =
    selectedFilter === 'all'
      ? orders
      : orders.filter((o) => o.status === selectedFilter);

  const stats = {
    total: orders.length,
    submitted: orders.filter((o) => o?.status === 'SUBMITTED').length,
    received: orders.filter((o) => o?.status === 'RECEIVED_BY_SPO_TEAM').length,
    wip: orders.filter((o) => o?.status === 'WIP').length,
    completed: orders.filter((o) => o?.status === 'COMPLETED').length,
    closed: orders.filter((o) => o?.status === 'CLOSED').length,
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
          SPO Orders
        </h1>
        <p className="mt-1 text-slate-600">
          Your special orders. Status updates from admin will appear here.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">{stats?.total || '-'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200">
              <Inbox className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Submitted</p>
              <p className="text-xl font-bold text-slate-900">{stats?.submitted || '-'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Wrench className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700">WIP</p>
              <p className="text-xl font-bold text-amber-900">{stats?.wip || '-'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700">Completed</p>
              <p className="text-xl font-bold text-emerald-900">{stats?.completed || '-'}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-200">
              <XCircle className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-600">Closed</p>
              <p className="text-xl font-bold text-slate-900">{stats?.closed || '-'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {filters.map((item) => {
          const isSelected = selectedFilter === item.value;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item?.value)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {item?.title || '-'}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16">
          <Package className="h-16 w-16 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-600">
            No SPO orders found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedFilter === 'all'
              ? 'Your special orders will appear here after you submit them'
              : `No orders with status "${selectedFilter}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <SpoOrderCard key={order?._id} data={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default B2BMySpoOrders;
