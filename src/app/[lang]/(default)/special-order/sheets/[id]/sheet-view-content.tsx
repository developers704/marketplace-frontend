'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getSheetById, type SheetCategory } from '@/framework/basic-rest/sheets/sheets';
import { toast } from 'react-toastify';
import { ArrowLeft } from 'lucide-react';

type Props = {
  lang: string;
  id: string;
};

const SheetViewContent = ({ lang, id }: Props) => {
  const [sheet, setSheet] = useState<SheetCategory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const data = await getSheetById(id);
        if (!cancelled) setSheet(data);
      } catch (e: unknown) {
        if (!cancelled) setSheet(null);
        toast.error(e instanceof Error ? e.message : 'Failed to open report');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <section className="my-6 md:my-10 lg:my-12">
          <div className="h-[70vh] animate-pulse rounded-2xl bg-slate-100" />
        </section>
      </Container>
    );
  }

  if (!sheet) {
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <section className="my-6 md:my-10 lg:my-12">
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
            <p className="text-slate-700">You do not have access to this sheet.</p>
            <Link href={`/${lang}/special-order/sheets`} className="mt-3 inline-block text-sm font-semibold underline">
              Back to Reports
            </Link>
          </div>
        </section>
      </Container>
    );
  }

  return (
    <Container>
      <Breadcrumb lang={lang} />
      <section className="my-6 md:my-10 lg:my-12">
        <div className="mb-3 flex items-center justify-between gap-2">
          <Link
            href={`/${lang}/special-order/sheets`}
            className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
          <h1 className="text-lg font-bold text-slate-900 md:text-xl">{sheet.title}</h1>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <iframe
            src={sheet.googleSheetUrl}
            className="w-full border-0 min-h-[500px] md:min-h-[650px]"
            title={sheet.title}
            loading="lazy"
            style={{ height: 'calc(100vh - 140px)' }}
          />
        </div>
      </section>
    </Container>
  );
};

export default SheetViewContent;
