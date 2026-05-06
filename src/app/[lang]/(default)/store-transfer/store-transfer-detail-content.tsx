'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getSocketOrigin } from '@/lib/socket-origin';
import { getImageUrl } from '@/lib/utils';
import {
  getStoreTransferChatMessages,
  getStoreTransferOrder,
  markStoreTransferReceived,
  postStoreTransferChatMessage,
  storeTransferStatusLabel,
  type B2bStoChatMessage,
  type B2bStoreTransferOrder,
} from '@/framework/basic-rest/b2bStoreTransfer/b2bStoreTransfer';
import { toast } from 'react-toastify';
import { Send } from 'lucide-react';
import Button from '@components/ui/button';

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

const CHAT_PREVIEW = 88;

type ReplyCtx = { id: string; sender: string; preview: string };

function hasDisplayValue(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return !Number.isNaN(value);
  if (typeof value === 'boolean') return true;
  return false;
}

const ATTR_FIELD_LABELS: { key: string; label: string }[] = [
  { key: 'centercarat', label: 'Center carat :' },
  { key: 'sidecarat', label: 'Side carat :' },
  { key: 'centerclarity', label: 'Center clarity :' },
  { key: 'sideclarity', label: 'Side clarity :' },
  { key: 'sidecolor', label: 'Side color :' },
  { key: 'centercolor', label: 'Center color :' },
  { key: 'avgweight', label: 'Average weight :' },
  { key: 'year', label: 'Year :' },
  { key: 'style', label: 'Style :' },
  { key: 'modelno', label: 'Model no :' },
  { key: 'centerstone', label: 'Center stone :' },
  { key: 'sidestone', label: 'Side stone :' },
  { key: 'stonetype', label: 'Stone type :' },
  { key: 'vendor', label: 'Vendor :' },
];

function humanizeAttrKey(key: string): string {
  const spaced = key
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();
  if (!spaced) return key;
  return spaced.charAt(0).toUpperCase() + spaced.slice(1) + " :";
}

function formatMoney(amount: number | undefined, currency?: string): string {
  if (amount === undefined || Number.isNaN(amount)) return '';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: currency && /^[A-Z]{3}$/i.test(currency) ? currency.toUpperCase() : 'USD',
    }).format(amount);
  } catch {
    return String(amount);
  }
}

/** One detail cell: label + value on one line (fits 2 columns per row on sm+) */
function OptionalDetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 items-baseline gap-2 rounded-lg border border-slate-100 bg-slate-50/50 px-3 py-2">
      <span className="shrink-0 text-[11px] font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      <span className="min-w-0 flex-1 text-sm leading-snug text-slate-900">{children}</span>
    </div>
  );
}

type Props = {
  lang: string;
  orderId: string;
  embedded?: boolean;
  onOrderUpdated?: () => void;
};

export default function StoreTransferDetailContent({
  lang,
  orderId,
  embedded = false,
  onOrderUpdated,
}: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<B2bStoreTransferOrder | null>(null);
  const [messages, setMessages] = useState<B2bStoChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyCtx | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [o, msgs] = await Promise.all([
        getStoreTransferOrder(orderId),
        getStoreTransferChatMessages(orderId),
      ]);
      setOrder(o);
      setMessages(msgs);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to load');
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [orderId]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    const token = getToken();
    if (!orderId || !token || !order) return;
    const origin = getSocketOrigin(BASE_API);
    const socket = io(origin, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socket.emit(
      'subscribeB2bStoreTransfer',
      { orderId, token },
      (ack: { ok?: boolean; error?: string }) => {
        if (ack && ack.ok === false && ack.error) {
          console.warn('B2B transfer socket:', ack.error);
        }
      },
    );
    socket.on('b2bStoreTransferChatMessage', (msg: B2bStoChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });
    return () => {
      socket.emit('unsubscribeB2bStoreTransfer', orderId);
      socket.disconnect();
    };
  }, [orderId, order?._id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !orderId) return;
    setSending(true);
    try {
      const saved = await postStoreTransferChatMessage(orderId, text, replyTo?.id || undefined);
      setChatInput('');
      setReplyTo(null);
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(saved._id))) return prev;
        return [...prev, saved];
      });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Send failed');
    } finally {
      setSending(false);
    }
  };

  const makePreview = (t: string) => {
    const c = String(t || '').replace(/\s+/g, ' ').trim();
    return c.length > CHAT_PREVIEW ? `${c.slice(0, CHAT_PREVIEW)}…` : c;
  };

  const jumpTo = (id?: string | null) => {
    if (!id) return;
    msgRefs.current[String(id)]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleReceived = async () => {
    if (!orderId) return;
    setReceiving(true);
    try {
      const updated = await markStoreTransferReceived(orderId);
      setOrder(updated);
      toast.success('Marked as received');
      onOrderUpdated?.();
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setReceiving(false);
    }
  };

  if (loading) {
    if (embedded) {
      return <p className="py-16 text-center text-slate-600">Loading…</p>;
    }
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <p className="py-16 text-center text-slate-600">Loading…</p>
      </Container>
    );
  }

  if (!order) {
    if (embedded) {
      return (
        <div className="py-16 text-center">
          <p className="text-slate-600">Request not found or access denied.</p>
          <Link
            href={`/${lang}/special-order`}
            className="mt-4 inline-block text-sm font-semibold underline"
          >
            Back to Special Order
          </Link>
        </div>
      );
    }
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <div className="py-16 text-center">
          <p className="text-slate-600">Request not found or access denied.</p>
          <Link href={`/${lang}/marketplace`} className="mt-4 inline-block text-sm font-semibold underline">
            Back to marketplace
          </Link>
        </div>
      </Container>
    );
  }

  const chatLocked = order.status === 'REJECTED' || order.status === 'RECEIVED';
  const sku = order.skuId;
  const attr = sku?.attributes || {};
  const imageUrls = (sku?.images || []).filter((u): u is string => typeof u === 'string' && u.trim().length > 0);

  const productTitle =
    (hasDisplayValue(attr.descriptionname) ? String(attr.descriptionname) : '') ||
    order.vendorProductId?.title ||
    order.vendorProductId?.vendorModel ||
    '';

  /** Shown as product title when present */
  const handledAttrKeys = new Set([
    ...ATTR_FIELD_LABELS.map(({ key }) => key),
    'descriptionname',
  ]);
  const extraAttrEntries = Object.entries(attr).filter(
    ([key, val]) => !handledAttrKeys.has(key) && hasDisplayValue(val),
  );

  const body = (
    <div className={`py-6 space-y-6 ${embedded ? '' : 'max-w-4xl mx-auto'}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Store transfer request</h1>
          <p className="text-sm text-slate-500 mt-1">
            {order.ticketNumber || order._id} · {storeTransferStatusLabel(order.status)}
          </p>
        </div>
        {order.status === 'DELIVERED' ? (
          <Button loading={receiving} onClick={() => void handleReceived()} className="shrink-0">
            Mark as received
          </Button>
        ) : null}
      </div>

      <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-wide text-slate-800">Product</h2>

        <div
          className={`grid gap-6 ${imageUrls.length > 0 ? 'md:grid-cols-[minmax(0,200px)_1fr] lg:grid-cols-[minmax(0,240px)_1fr]' : ''}`}
        >
          {imageUrls.length > 0 ? (
            <div className="space-y-3">
              <div className="aspect-square w-full max-w-[240px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={getImageUrl(BASE_API, imageUrls[0])}
                  alt={productTitle || 'Product'}
                  className="h-full w-full object-contain"
                />
              </div>
              {imageUrls.length > 1 ? (
                <div className="flex max-w-[240px] flex-wrap gap-2">
                  {imageUrls.slice(1).map((src, i) => (
                    <div
                      key={`${src}-${i}`}
                      className="h-14 w-14 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
                    >
                      <img
                        src={getImageUrl(BASE_API, src)}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="min-w-0 space-y-3">
            {hasDisplayValue(productTitle) ? (
              <p className="text-base font-semibold leading-snug text-slate-900">{productTitle}</p>
            ) : null}

            <div className="grid grid-cols-2 gap-2">
              {hasDisplayValue(sku?.sku) ? (
                <OptionalDetailRow label="SKU :">
                  <span className="font-mono">{sku?.sku}</span>
                </OptionalDetailRow>
              ) : null}

              {hasDisplayValue(sku?.metalType) ? (
                <OptionalDetailRow label="Metal type :">{sku?.metalType}</OptionalDetailRow>
              ) : null}

              {hasDisplayValue(sku?.metalColor) ? (
                <OptionalDetailRow label="Metal color :">{sku?.metalColor}</OptionalDetailRow>
              ) : null}

              {hasDisplayValue(sku?.size) ? (
                <OptionalDetailRow label="Size :">{sku?.size}</OptionalDetailRow>
              ) : null}

              {hasDisplayValue(sku?.price) ? (
                <OptionalDetailRow label="price :">
                  {formatMoney(sku?.price, order.currency)}
                </OptionalDetailRow>
              ) : null}

              {ATTR_FIELD_LABELS.map(({ key, label }) => {
                const raw = attr[key as string];
                if (!hasDisplayValue(raw)) return null;
                return (
                  <OptionalDetailRow key={String(key)} label={label}>
                    {String(raw)}
                  </OptionalDetailRow>
                );
              })}

              {extraAttrEntries.map(([key, val]) => (
                <OptionalDetailRow key={key} label={humanizeAttrKey(key)}>
                  {String(val)}
                </OptionalDetailRow>
              ))}

              <OptionalDetailRow label="Qty :">{order.quantity}</OptionalDetailRow>

              <OptionalDetailRow label="From warehouse :">
                {order.sourceWarehouseId?.name || '—'}
              </OptionalDetailRow>

              <OptionalDetailRow label="To your store :">
                {order.destWarehouseId?.name || '—'}
              </OptionalDetailRow>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-slate-50 overflow-hidden flex flex-col" style={{ minHeight: 360 }}>
        <div className="px-4 py-2 border-b border-slate-200 bg-white text-sm font-semibold text-slate-800">
          Messages
        </div>
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[420px]">
          {messages.map((m) => (
            <div
              key={String(m._id)}
              ref={(el) => {
                msgRefs.current[String(m._id)] = el;
              }}
              className={`flex ${m.role === 'admin' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  m.role === 'admin' ? 'bg-white border border-slate-200' : 'bg-slate-900 text-white'
                }`}
              >
                <div className="text-xs opacity-70 mb-1">{m.senderName || m.role}</div>
                {m.replyToMessageId && m.replyToText ? (
                  <button
                    type="button"
                    className={`mt-1 mb-2 w-full rounded-lg border p-2 text-left text-xs ${
                      m.role === 'admin'
                        ? 'border-slate-200 bg-slate-50 text-slate-600'
                        : 'border-white/30 bg-white/10 text-white/90'
                    }`}
                    onClick={() => jumpTo(m.replyToMessageId)}
                  >
                    <span className={`font-semibold ${m.role === 'admin' ? 'text-slate-700' : 'text-white'}`}>
                      Reply to {m.replyToSenderName || 'message'}
                    </span>
                    <div className="truncate opacity-90">{m.replyToText}</div>
                  </button>
                ) : null}
                <div className="whitespace-pre-wrap break-words">{m.text}</div>
                {!chatLocked ? (
                  <button
                    type="button"
                    className={`mt-2 text-xs font-medium underline-offset-2 hover:underline ${
                      m.role === 'admin' ? 'text-violet-700' : 'text-amber-300'
                    }`}
                    onClick={() =>
                      setReplyTo({
                        id: String(m._id),
                        sender:
                          m.role === 'admin' ? m.senderName || 'Admin' : m.senderName || 'You',
                        preview: makePreview(m.text || ''),
                      })
                    }
                  >
                    Reply
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          <div ref={listEndRef} />
        </div>
        {!chatLocked ? (
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex flex-col gap-2">
            {replyTo ? (
              <div className="flex items-start justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-xs">
                <div className="min-w-0">
                  <span className="font-semibold text-slate-800">Replying to {replyTo.sender}</span>
                  <div className="truncate text-slate-600">&quot;{replyTo.preview}&quot;</div>
                </div>
                <button
                  type="button"
                  className="shrink-0 text-slate-600 hover:text-slate-900"
                  onClick={() => setReplyTo(null)}
                >
                  ✕
                </button>
              </div>
            ) : null}
            <div className="flex gap-2">
              <textarea
                className="min-h-[44px] flex-1 resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-slate-400 focus:outline-none"
                placeholder="Write a message…"
                rows={2}
                maxLength={4000}
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button type="submit" loading={sending} disabled={!chatInput.trim()} className="shrink-0 self-end">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
            {order.status === 'REJECTED' ? 'This request was rejected.' : 'This request is complete.'}
          </div>
        )}
      </div>
    </div>
  );

  if (embedded) {
    return body;
  }

  return (
    <Container>
      <Breadcrumb lang={lang} />
      {body}
    </Container>
  );
}
