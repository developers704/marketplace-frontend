'use client';

import React, { useState } from 'react';
import {
  Package,
  Store,
  ChevronDown,
  ChevronUp,
  Wrench,
  Inbox,
  XCircle,
  CheckCircle2,
} from 'lucide-react';
import type { SpecialOrder } from '@/framework/basic-rest/spo/spo';

interface SpoOrderCardProps {
  data: SpecialOrder;
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
  SUBMITTED: {
    label: 'Submitted',
    bg: 'bg-slate-50/80 border-slate-200',
    text: 'text-slate-800',
    icon: Inbox,
  },
  RECEIVED_BY_SPO_TEAM: {
    label: 'Received by SPO Team',
    bg: 'bg-sky-50/80 border-sky-200',
    text: 'text-sky-800',
    icon: Package,
  },
  WIP: {
    label: 'Work in Progress',
    bg: 'bg-amber-50/80 border-amber-200',
    text: 'text-amber-800',
    icon: Wrench,
  },
  COMPLETED: {
    label: 'Completed',
    bg: 'bg-emerald-50/80 border-emerald-200',
    text: 'text-emerald-800',
    icon: CheckCircle2,
  },
  CLOSED: {
    label: 'Closed',
    bg: 'bg-slate-100 border-slate-300',
    text: 'text-slate-700',
    icon: XCircle,
  },
};

const SpoOrderCard = ({ data }: SpoOrderCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = STATUS_CONFIG[data.status] || STATUS_CONFIG.SUBMITTED;
  const StatusIcon = config.icon;

  const storeName =
    typeof data.storeId === 'object' && data.storeId?.name
      ? data.storeId.name
      : 'N/A';

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:border-slate-300/80">
      <div
        className={`absolute left-0 top-0 h-1 w-full ${
          data.status === 'COMPLETED'
            ? 'bg-gradient-to-r from-emerald-400 to-emerald-600'
            : data.status === 'CLOSED'
            ? 'bg-slate-400'
            : data.status === 'WIP'
            ? 'bg-gradient-to-r from-amber-400 to-amber-600'
            : 'bg-gradient-to-r from-slate-400 to-sky-500'
        }`}
      />

      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold ${config?.bg} ${config?.text}`}
              >
                <StatusIcon className="h-3.5 w-3.5" />
                {config?.label || '-'}
              </span>
              <span className="font-mono text-sm font-semibold text-slate-800">
                {data?.ticketNumber || '-'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span>Requested • {formatDate(data?.createdAt)}</span>
              <span className="text-slate-300">•</span>
              <div className="flex items-center gap-1.5">
                <Store className="h-4 w-4 text-slate-400" />
                <span className="font-medium">{storeName}</span>
              </div>
            </div>
          </div>
          {data?.eta && (
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                ETA
              </p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(data?.eta)}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            {data?.typeOfRequest?.replace(/_/g, ' ') || '-'}
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            {data?.metalQuality?.replace(/_/g, ' ') || '-'}
          </span>
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-medium text-slate-700">
            {data?.diamondType?.replace(/_/g, ' ') || '-'}
          </span>
          {data?.referenceSkuNumber && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-slate-600">
              Ref: {data?.referenceSkuNumber || '-'}
            </span>
          )}
        </div>

        {(data?.notes || (data?.attachments && data?.attachments?.length > 0)) && (
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
                  View notes & attachments
                </>
              )}
            </button>
            {isExpanded && (
              <div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-slate-50/30 p-4">
                {data?.notes && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Notes
                    </p>
                    <p className="mt-1 text-sm text-slate-700">{data?.notes}</p>
                  </div>
                )}
                {data?.attachments && data?.attachments?.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-500">
                      Attachments ({data?.attachments?.length})
                    </p>
                    <p className="mt-1 text-xs text-slate-600">
                      {data?.attachments.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SpoOrderCard;
