'use client';

import React, { useEffect, useState } from 'react';
import B2BOrderHistoryCard from '@/components/common/b2b-order-history-card';
import { OrderSkeleton } from '@/components/ui/skeletons';
import { getB2BRequests, type B2BPurchaseRequest } from '@/framework/basic-rest/catalogV2/b2b-requests';
import { Package, Clock, CheckCircle2, XCircle } from 'lucide-react';

const filters = [
  { id: 1, title: 'All Requests', value: 'all' },
  { id: 2, title: 'Pending', value: 'pending' },
  { id: 3, title: 'Approved', value: 'approved' },
  { id: 4, title: 'Rejected', value: 'rejected' },
];

const B2BMyOrders = () => {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [orders, setOrders] = useState<B2BPurchaseRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchB2BRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getB2BRequests();
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchB2BRequests();
  }, []);

  const filteredOrders = orders.filter((order) => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'pending')
      return ['PENDING_DM', 'PENDING_CM', 'PENDING_ADMIN'].includes(order.status);
    if (selectedFilter === 'approved') return order.status === 'APPROVED';
    if (selectedFilter === 'rejected') return order.status === 'REJECTED';
    return true;
  });

  const stats = {
    total: orders.length,
    pending: orders.filter((o) =>
      ['PENDING_DM', 'PENDING_CM', 'PENDING_ADMIN'].includes(o.status)
    ).length,
    approved: orders.filter((o) => o.status === 'APPROVED').length,
    rejected: orders.filter((o) => o.status === 'REJECTED').length,
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
         Inventory Orders
        </h1>
        <p className="mt-1 text-slate-600">
          Track your Inventory Orders purchase requests and approval status
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <Package className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Total</p>
              <p className="text-xl font-bold text-slate-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-amber-200/60 bg-amber-50/30 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-amber-700">Pending</p>
              <p className="text-xl font-bold text-amber-900">{stats.pending}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-emerald-200/60 bg-emerald-50/30 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-emerald-700">Approved</p>
              <p className="text-xl font-bold text-emerald-900">{stats.approved}</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-rose-200/60 bg-rose-50/30 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-rose-100">
              <XCircle className="h-5 w-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-rose-700">Rejected</p>
              <p className="text-xl font-bold text-rose-900">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-4">
        {filters.map((item) => {
          const isSelected = selectedFilter === item.value;
          return (
            <button
              key={item.id}
              onClick={() => setSelectedFilter(item.value)}
              className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition-all ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
              }`}
            >
              {item.title}
            </button>
          );
        })}
      </div>

      {/* Order list */}
      {isLoading ? (
        <OrderSkeleton />
      ) : filteredOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 py-16">
          <Package className="h-16 w-16 text-slate-300" />
          <p className="mt-4 text-lg font-medium text-slate-600">
            No Inventory orders found
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {selectedFilter === 'all'
              ? 'Your Inventory Orders purchase requests will appear here'
              : `No ${selectedFilter} requests`}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <B2BOrderHistoryCard key={order._id} data={order} />
          ))}
        </div>
      )}
    </div>
  );
};

export default B2BMyOrders;