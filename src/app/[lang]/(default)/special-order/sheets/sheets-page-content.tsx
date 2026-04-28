'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getMySheets, type SheetCategory } from '@/framework/basic-rest/sheets/sheets';
import { toast } from 'react-toastify';
import { ExternalLink } from 'lucide-react';

type Props = {
  lang: string;
};

const SheetsPageContent = ({ lang }: Props) => {
  const [rows, setRows] = useState<SheetCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getMySheets();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e: unknown) {
        if (!cancelled) setRows([]);
        toast.error(e instanceof Error ? e.message : 'Failed to load reports');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container>
      <Breadcrumb lang={lang} />
      <section className="my-6 md:my-10 lg:my-12">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 md:text-3xl">PNL Reports</h1>
          <p className="mt-1 text-sm text-slate-600">
            Open reports assigned to your account.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-6">
            {[1, 2, 3, 4, 5, 6 , 7, 8 , 9 , 10 , 11 , 12].map((n) => (
              <div key={n} className="h-40 animate-pulse rounded-2xl bg-slate-100" />
            ))}
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-10 text-center text-slate-500">
            No reports assigned yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-6">
            {rows.map((row) => (
              <div
                key={row._id}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Category
                </p> */}
                <h3 className="mt-1 text-lg font-bold text-slate-900">{row.title}</h3>
                <p className="mt-1 text-xs text-slate-500">
                  Created: {row?.createdAt ? new Date(row?.createdAt).toLocaleDateString() : '—'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/${lang}/special-order/sheets/${row._id}`}
                    className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Open
                  </Link>
                  {/* <a
                    href={row?.googleSheetUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700"
                  >
                    URL <ExternalLink className="h-3.5 w-3.5" />
                  </a> */}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Container>
  );
};

export default SheetsPageContent;
