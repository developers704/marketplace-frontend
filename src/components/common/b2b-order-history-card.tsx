'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { getImageUrl } from '@/lib/utils';
import {
  Package,
  Store,
  ChevronDown,
  ChevronUp,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import type { B2BPurchaseRequest } from '@/framework/basic-rest/catalogV2/b2b-requests';

interface B2BOrderHistoryCardProps {
  data: B2BPurchaseRequest;
}

function formatDate(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; icon: React.ElementType }
> = {
  PENDING_DM: {
    label: 'Awaiting DM Approval',
    bg: 'bg-amber-50/80 border-amber-200',
    text: 'text-amber-800',
    icon: Clock,
  },
  PENDING_CM: {
    label: 'Awaiting CM Approval',
    bg: 'bg-sky-50/80 border-sky-200',
    text: 'text-sky-800',
    icon: Clock,
  },
  PENDING_ADMIN: {
    label: 'Awaiting Admin Approval',
    bg: 'bg-violet-50/80 border-violet-200',
    text: 'text-violet-800',
    icon: AlertCircle,
  },
  APPROVED: {
    label: 'Approved',
    bg: 'bg-emerald-50/80 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle2,
  },
  REJECTED: {
    label: 'Rejected',
    bg: 'bg-rose-50/80 border-rose-200',
    text: 'text-rose-800',
    icon: XCircle,
  },
};

const B2BOrderHistoryCard = ({ data }: B2BOrderHistoryCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.PENDING_DM;
  const StatusIcon = config.icon;

  const price = data.cartItemPrice ?? data.skuId?.price ?? 0;
  const currency = data.cartItemCurrency ?? data.skuId?.currency ?? 'USD';
  const subtotal = price * data.quantity;
  const imageSrc =
    data.skuId?.images?.[0] ||
    (data.skuId as any)?.image ||
    null;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300/80">
      {/* Top accent bar */}
      <div
        className={`absolute left-0 top-0 h-1 w-full ${
          data.status === 'APPROVED'
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
            : data.status === 'REJECTED'
            ? 'bg-gradient-to-r from-rose-400 to-rose-600'
            : 'bg-gradient-to-r from-amber-400 via-sky-400 to-violet-500'
        }`}
      />

      <div className="p-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config.bg} ${config.text}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {config.label}
              </span>
              <span className="text-sm text-slate-500">
                Requested • {formatDate(data.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-2 text-slate-600">
              <span className="font-mono text-xs font-medium">
                #{data._id.slice(-8).toUpperCase()}
              </span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Store className="h-4 w-4 text-slate-400" />
                <span className="text-sm font-medium">
                  {data.storeWarehouseId?.name || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Total
            </p>
            <p className="text-xl font-bold text-slate-900">
              {currency} {subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>

        {/* Product summary */}
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-4">
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {imageSrc ? (
                <Image
                  src={getImageUrl(
                    process.env.NEXT_PUBLIC_BASE_API as string,
                    imageSrc,
                    '/assets/images/products/item1.png'
                  )}
                  alt={data.vendorProductId?.title || 'Product'}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-8 w-8 text-slate-300" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold text-slate-900">
                {data.vendorProductId?.title || '-'}
              </h3>
              <p className="text-sm text-slate-500">
                {data.vendorProductId?.vendorModel || '-'}
              </p>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-600">
                <span className="font-mono">SKU: {data?.skuId?.sku || '-'}</span>
                {[
                  data?.skuId?.metalColor,
                  data?.skuId?.metalType,
                  data?.skuId?.size,
                ]
                  .filter(Boolean)
                  .map((v) => (
                    <span key={v} className="rounded bg-slate-100 px-1.5 py-0.5">
                      {v}
                    </span>
                  ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-6 border-l border-slate-200 pl-6 sm:pl-6">
            <div className="text-center">
              <p className="text-xs font-medium text-slate-400">Qty</p>
              <p className="text-lg font-bold text-slate-900">{data?.quantity || "-"}</p>
            </div>
            <div className="text-center">
              <p className="text-xs font-medium text-slate-400">Unit Price</p>
              <p className="text-lg font-semibold text-slate-800">
                {currency}  {price?.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        </div>

        {/* Expand for rejection reason / approval history */}
        {/* {(data.rejection || data.approvals?.dm || data.approvals?.cm || data.approvals?.admin) && (
          <>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50/50 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4" />
                  Hide details
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" />
                  View details
                </>
              )}
            </button>
            {isExpanded && (
              <div className="mt-4 space-y-4 rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                {data.rejection && (
                  <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-4">
                    <p className="text-sm font-semibold text-rose-800">
                      Rejection reason
                    </p>
                    <p className="mt-1 text-sm text-rose-700">
                      {data.rejection.reason || 'No reason provided'}
                    </p>
                  </div>
                )}
                {(data.approvals?.dm || data.approvals?.cm || data.approvals?.admin) && (
                  <div>
                    <p className="text-sm font-semibold text-slate-700">
                      Approval trail
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-600">
                      {data.approvals.dm && (
                        <li>DM • {formatDate(data.approvals.dm.approvedAt)}</li>
                      )}
                      {data.approvals.cm && (
                        <li>CM • {formatDate(data.approvals.cm.approvedAt)}</li>
                      )}
                      {data.approvals.admin && (
                        <li>
                          Admin • {formatDate(data.approvals.admin.approvedAt)}
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </>
        )} */}
      </div>
    </div>
  );
};

export default B2BOrderHistoryCard;
