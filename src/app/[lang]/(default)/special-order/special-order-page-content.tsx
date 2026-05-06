'use client';

import React, { useEffect, useState, useRef, Suspense } from 'react';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getSelectedWarehouse } from '@/lib/selected-warehouse';
import { createSpecialOrder } from '@/framework/basic-rest/spo/spo';
import { toast } from 'react-toastify';
import { Upload, Store, FileText, Palette } from 'lucide-react';
import DrawingCanvas, { type DrawingCanvasRef } from '@/components/common/drawing-canvas';
import SpecialOrderSidebarTabs from './special-order-sidebar-tabs';
import dayjs from 'dayjs';

const GOLD_ACCENT = '#C6A87D';

const TYPE_OPTIONS = [
  { value: 'WATCH', label: 'WATCH' },
  { value: 'WATCH_PART', label: 'WATCH PART' },
  { value: 'STULLER_ITEM', label: 'STULLER ITEM' },
  { value: 'QG_ITEM', label: 'QG ITEM' },
  { value: 'CUSTOM_JEWELRY_PIECE', label: 'CUSTOM JEWELRY PIECE' },
  { value: 'OTHERS', label: 'OTHERS' },
];

const METAL_OPTIONS = [
  { value: '10KT_WHITE_GOLD', label: '10kt White Gold' },
  { value: '10KT_YELLOW_GOLD', label: '10kt Yellow Gold' },
  { value: '10KT_ROSE_GOLD', label: '10kt Rose Gold' },
  { value: '14KT_WHITE_GOLD', label: '14kt White Gold' },
  { value: '14KT_YELLOW_GOLD', label: '14kt Yellow Gold' },
  { value: '14KT_ROSE_GOLD', label: '14kt Rose Gold' },
  { value: '18KT_WHITE_GOLD', label: '18kt White Gold' },
  { value: '18KT_YELLOW_GOLD', label: '18kt Yellow Gold' },
  { value: '18KT_ROSE_GOLD', label: '18kt Rose Gold' },
  { value: '22KT_YELLOW_GOLD', label: '22kt Yellow Gold' },
  { value: 'PLATINUM', label: 'Platinum' },
  { value: 'SILVER', label: 'Silver' },
  { value: 'SILVER_VERMEIL_YELLOW', label: 'Silver - Vermeil (Yellow)' },
  { value: 'NA', label: 'N/A' },
];

const DIAMOND_TYPE_OPTIONS = [
  { value: 'NATURAL', label: 'Natural' },
  { value: 'LAB_GROWN', label: 'Lab-Grown' },
  { value: 'NA', label: 'N/A' },
];

const DIAMOND_COLOR_OPTIONS = [
  'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O-P', 'Q-R', 'S-Z', 'Fancy',
];

const DIAMOND_CLARITY_OPTIONS = [
  'FL', 'IF', 'VVS1', 'VVS2', 'VS1', 'VS2', 'SI1', 'SI2', 'SI3', 'I1', 'I2', 'I3',
];

const SpecialOrderPageContent = ({ lang }: { lang: string }) => {
  const [store, setStore] = useState<{ _id: string; name: string } | null>(null);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const drawingCanvasRef = React.useRef<DrawingCanvasRef>(null);
  const canvasBoxRef = useRef<HTMLDivElement | null>(null);
  const [canvaSize , setCanvaSize] = useState({

    width:580,
    height:380,
  })

  const [form, setForm] = useState({
    receiptNumber: '',
    customerNumber: '',
    typeOfRequest: '',
    eta: '',
    referenceSkuNumber: '',
    metalQuality: '',
    diamondType: '',
    diamondColor: '',
    diamondClarity: '',
    diamondDetails: '',
    customization: '',
    notes: '',
  });

  useEffect(() => {
    const wh = getSelectedWarehouse();
    if (wh) {
      const id = wh._id || wh;
      const name = typeof wh === 'object' && wh.name ? wh.name : String(wh);
      setStore({ _id: String(id), name });
    } else {
      setStore(null);
    }
  }, []);

useEffect(() => {
  const el = canvasBoxRef.current;
  if (!el) return;

  const resizeCanvas = () => {
    const parentWidth = Math.floor(el.clientWidth);
    if (!parentWidth) return;

    const nextWidth = parentWidth;
    const nextHeight = Math.min(
      420,
      Math.max(260, Math.floor(parentWidth * 0.56)),
    );

    setCanvaSize((prev) =>
      prev.width === nextWidth && prev.height === nextHeight
        ? prev
        : { width: nextWidth, height: nextHeight },
    );
  };

  resizeCanvas();

  const observer = new ResizeObserver(resizeCanvas);
  observer.observe(el);

  return () => observer.disconnect();
}, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p : any) => ({ ...p, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((p : any) => [...p, ...files].slice(0, 10));
  };

  const removeFile = (index: number) => {
    setAttachments((p: any) => p.filter((_:any, i : any) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store) {
      toast.error('No store/warehouse selected. Please log in again with a warehouse.');
      return;
    }
    if (!form.typeOfRequest || !form.metalQuality || !form.diamondType) {
      toast.error('TYPE OF REQUEST, METAL QUALITY, and DIAMOND TYPE are required.');
      return;
    }
    setSubmitting(true);
    try {
      let canvasFile: File | null = null;
      const blob = await drawingCanvasRef.current?.getBlob();
      if (blob) canvasFile = new File([blob], 'canvas-drawing.png', { type: 'image/png' });

      const res = await createSpecialOrder(
        {
          receiptNumber: form.receiptNumber,
          customerNumber: form.customerNumber,
          typeOfRequest: form.typeOfRequest,
          eta: form?.eta || '',
          referenceSkuNumber: form.referenceSkuNumber,
          metalQuality: form.metalQuality,
          diamondType: form.diamondType,
          diamondColor: form.diamondColor,
          diamondClarity: form.diamondClarity,
          diamondDetails: form.diamondDetails,
          customization: form.customization,
          notes: form.notes,
        },
        attachments.length ? attachments : undefined,
        canvasFile || undefined
      );
      toast.success(`Special order submitted! Ticket: ${res.ticketNumber}`);
      setSidebarRefresh((n) => n + 1);
      setForm({
        receiptNumber: '',
        customerNumber: '',
        typeOfRequest: '',
        eta: '',
        referenceSkuNumber: '',
        metalQuality: '',
        diamondType: '',
        diamondColor: '',
        diamondClarity: '',
        diamondDetails: '',
        customization: '',
        notes: '',
      });
      setAttachments([]);
      drawingCanvasRef.current?.clear?.();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container>
      <Breadcrumb lang={lang} />

      <section className="my-6 md:my-10 lg:my-12 w-full">
        {/* Hero header */}
        {/* <div className='flex items-center justify-center'>

        <div
          className="rounded-2xl md:rounded-3xl px-6 py-8 md:px-10 md:py-4 mb-8 md:mb-10 "
          style={{
            background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)',
            borderBottom: `3px solid ${GOLD_ACCENT}`,
          }}
          >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white tracking-tight">
            Special Order <span style={{ color: GOLD_ACCENT }}>(SPO)</span> Form
          </h1>
          <p className="mt-2 md:mt-3 text-slate-400 text-sm md:text-base  max-w-2xl">
            Submit your custom jewelry or watch requests. Fill in the details below and our team will process your order.
          </p>
        </div>
          </div> */}

        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <aside className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-80 xl:w-96 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <Suspense
              fallback={<div className="h-48 animate-pulse rounded-xl bg-slate-100" aria-hidden />}
            >
              <SpecialOrderSidebarTabs lang={lang} spoRefreshTrigger={sidebarRefresh} />
            </Suspense>
          </aside>

          <div className="min-w-0 flex-1">
        {/* Form card */}
        <div className="mx-auto max-w-3xl lg:mx-0 lg:max-w-none">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
            <div
              className="rounded-xl md:rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200/80 bg-white space-y-6 md:space-y-8"
              style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
            >
              {/* STORE - Auto, Read-only */}
                <div>
                  
                <label className="block text-sm font-semibold text-slate-700 mb-2">CUSTOMIZATION  <span className="text-red-500">*</span></label>
                <textarea
                  name="customization"
                  required
                  value={form.customization}
                  onChange={handleChange}
                  rows={3}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue resize-none"
                  placeholder="Describe customization requirements"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Store className="inline h-4 w-4 mr-1.5" style={{ color: GOLD_ACCENT }} /> STORE  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  readOnly
                  required
                  value={store?.name || '— Select warehouse and log in again —'}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-slate-600 cursor-not-allowed focus:ring-2 focus:ring-slate-200"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Receipt Number  <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    name="receiptNumber"
                    required
                    value={form.receiptNumber}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    placeholder="Enter receipt number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Customer Number  <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    required
                    name="customerNumber"
                    value={form.customerNumber}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                    placeholder="Enter customer number"
                  />
                </div>
              </div>

              {/* TYPE OF REQUEST - Required */}
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6'>
                <div>

                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  TYPE OF REQUEST <span className="text-red-500">*</span>
                </label>
                <select
                  name="typeOfRequest"
                  value={form.typeOfRequest}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
                  >
                  <option value="">Select...</option>
                  {TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                </div>
                
                <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  ETA (Expected Delivery Date)
                </label>

                <input
                  type="date"
                  name="eta"
                  value={form.eta || ''}
                  min={dayjs().format('YYYY-MM-DD')} // no past dates
                  onChange={(e) =>
                    setForm({
                      ...form,
                      eta: dayjs(e.target.value).format('YYYY-MM-DD'),
                    })
                  }
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />

                {/* Preview formatted */}
                {form.eta && (
                  <p className="text-xs text-slate-500 mt-1">
                    Selected: {dayjs(form.eta).format('DD MMM YYYY')}
                  </p>
                )}
              </div>
               
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Reference SKU Number</label>
                <input
                  type="text"
                  name="referenceSkuNumber"
                  value={form.referenceSkuNumber}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  placeholder="Enter reference SKU"
                />
              </div>

              {/* METAL QUALITY - Required */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  METAL QUALITY <span className="text-red-500">*</span>
                </label>
                <select
                  name="metalQuality"
                  value={form.metalQuality}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
                >
                  <option value="">Select...</option>
                  {METAL_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              {/* DIAMOND TYPE - Required */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  DIAMOND TYPE <span className="text-red-500">*</span>
                </label>
                <select
                  name="diamondType"
                  value={form.diamondType}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
                >
                  <option value="">Select...</option>
                  {DIAMOND_TYPE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 md:gap-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">DIAMOND COLOR</label>
                  <select
                    name="diamondColor"
                    value={form.diamondColor}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
                  >
                    <option value="">Select...</option>
                    {DIAMOND_COLOR_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">DIAMOND CLARITY</label>
                  <select
                    name="diamondClarity"
                    value={form.diamondClarity}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue bg-white"
                  >
                    <option value="">Select...</option>
                    {DIAMOND_CLARITY_OPTIONS.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">DIAMOND DETAILS</label>
                <input
                  type="text"
                  name="diamondDetails"
                  value={form.diamondDetails}
                  onChange={handleChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                  placeholder="Enter diamond details"
                />
              </div>

            

              {/* Drawing Canvas - responsive wrapper */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Palette className="inline h-4 w-4 mr-1.5" style={{ color: GOLD_ACCENT }} /> Draw Your Design
                </label>
                <div className="w-full overflow-hidden rounded-xl border  border-slate-200 bg-white ">
                  <div ref={canvasBoxRef} className='w-full min-w-0'>
                    <DrawingCanvas
                      ref={drawingCanvasRef}
                      width={canvaSize.width}
                      height={canvaSize.height}
                    />
                  </div>
                </div>
              </div>

              {/* Attachments */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  <Upload className="inline h-4 w-4 mr-1.5" style={{ color: GOLD_ACCENT }} /> Attachments (Image or Video)
                </label>
                <input
                  type="file"
                  accept="image/*,video/*"
                  capture="environment"
                  multiple
                  onChange={handleFileChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 file:mr-4 file:rounded-lg file:border-0 file:px-4 file:py-2 file:bg-slate-100 file:text-slate-700 file:font-medium file:text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue"
                />
                {attachments.length > 0 && (
                  <ul className="mt-3 space-y-2">
                    {attachments.map((f : any, i: any) => (
                      <li key={i} className="flex items-center justify-between gap-2 text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2">
                        <span className="flex items-center gap-2 truncate">
                          <FileText className="h-4 w-4 shrink-0" />
                          {f.name}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeFile(i)}
                          className="text-red-600 hover:text-red-700 hover:underline shrink-0 text-xs font-medium"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>             

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">NOTES</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 transition-all focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue resize-none"
                  placeholder="Additional notes"
                />
              </div>

              <div className="pt-2 pb-1">
                <button
                  type="submit"
                  disabled={submitting || !store}
                  className="w-full sm:w-auto min-w-[200px] rounded-xl px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md"
                  style={{
                    background: `linear-gradient(135deg, ${GOLD_ACCENT} 0%, #a88b5c 100%)`,
                  }}
                  onMouseOver={(e) => {
                    if (!submitting && store) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #d4b88d 0%, #b89968 100%)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = `linear-gradient(135deg, ${GOLD_ACCENT} 0%, #a88b5c 100%)`;
                  }}
                >
                  {submitting ? 'Submitting...' : 'Submit Request'}
                </button>
              </div>
            </div>
          </form>
        </div>
        </div>
        </div>
      </section>
    </Container>
  );
};

export default SpecialOrderPageContent;

