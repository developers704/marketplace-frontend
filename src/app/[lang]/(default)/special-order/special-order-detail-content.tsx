'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getSocketOrigin } from '@/lib/socket-origin';
import {
  finalizeSpecialOrder,
  getSpecialOrderById,
  getSpoChatMessages,
  postSpoChatMessage,
  spoStatusLabel,
  type SpecialOrder,
  type SpoChatMessage,
} from '@/framework/basic-rest/spo/spo';
import { toast } from 'react-toastify';
import {
  ArrowLeft,
  Send,
  UserCircle2,
  ShieldCheck,
  Clock3,
  MessageSquare,
} from 'lucide-react';
import SpoOrdersSidebar from './spo-orders-sidebar';
const GOLD_ACCENT = '#C6A87D';
const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return (
    localStorage.getItem('auth_token') || localStorage.getItem('token') || ''
  );
}

const isVideo = (path: string) => /\.(mp4|webm|mov|avi|mkv)$/i.test(path);
const isImage = (path: string) => /\.(jpg|jpeg|png|gif|webp|bmp)$/i.test(path);

type Props = {
  lang: string;
  orderId: string;
};

type ReplyContext = {
  id: string;
  sender: string;
  preview: string;
};
const CHAT_REPLY_PREVIEW = 88;

const SpecialOrderDetailContent = ({ lang, orderId }: Props) => {
  const [order, setOrder] = useState<SpecialOrder | null>(null);
  const [messages, setMessages] = useState<SpoChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [sidebarRefresh, setSidebarRefresh] = useState(0);
  const [replyTo, setReplyTo] = useState<ReplyContext | null>(null);
  const [highlightedMessageId, setHighlightedMessageId] = useState<
    string | null
  >(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const messageRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

  const makePreview = (text: string) => {
    const compact = String(text || '')
      .replace(/\s+/g, ' ')
      .trim();
    return compact.length > CHAT_REPLY_PREVIEW
      ? `${compact.slice(0, CHAT_REPLY_PREVIEW)}...`
      : compact;
  };

  const jumpToMessage = (messageId?: string | null) => {
    if (!messageId) return;
    const el = messageRefs.current[String(messageId)];
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    setHighlightedMessageId(String(messageId));
    window.setTimeout(() => {
      setHighlightedMessageId((prev) =>
        prev === String(messageId) ? null : prev,
      );
    }, 1800);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [o, msgs] = await Promise.all([
        getSpecialOrderById(orderId),
        getSpoChatMessages(orderId),
      ]);
      setOrder(o);
      setMessages(msgs);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to load order';
      toast.error(msg);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadAll();
  }, [orderId]);

  // useEffect(() => {
  //   listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  // }, [messages.length]);

  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;

    el.scrollTo({
      top: el.scrollHeight,
      behavior: 'smooth',
    });
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
      'subscribeSpoOrder',
      { orderId, token },
      (ack: { ok?: boolean; error?: string }) => {
        if (ack && ack.ok === false && ack.error) {
          console.warn('SPO socket subscribe:', ack.error);
        }
      },
    );

    socket.on('spoChatMessage', (msg: SpoChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
    });

    return () => {
      socket.emit('unsubscribeSpoOrder', orderId);
      socket.disconnect();
    };
  }, [orderId, order?._id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if (!text || !orderId || order?.status === 'FINALIZED') return;
    setSending(true);
    try {
      const saved = await postSpoChatMessage(orderId, text, replyTo?.id);
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

  const handleFinalize = async () => {
    if (!orderId) return;
    setFinalizing(true);
    try {
      const updated = await finalizeSpecialOrder(orderId);
      setOrder(updated);
      setSidebarRefresh((n) => n + 1);
      toast.success('Order marked as finalized. Thank you!');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Finalize failed');
    } finally {
      setFinalizing(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <p className="py-16 text-center text-slate-600">Loading order…</p>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <div className="py-16 text-center">
          <p className="text-slate-600">
            Order not found or you do not have access.
          </p>
          <Link
            href={`/${lang}/special-order`}
            className="mt-4 inline-block text-sm font-semibold text-slate-900 underline"
          >
            Back to Special Order
          </Link>
        </div>
      </Container>
    );
  }

  const storeName =
    typeof order?.storeId === 'object' && order?.storeId?.name
      ? order?.storeId?.name
      : '—';
  const videos = (order?.attachments || []).filter(isVideo);
  const images = (order?.attachments || []).filter(isImage);
  const chatLocked = order?.status === 'FINALIZED';

  return (
    <Container>
      <Breadcrumb lang={lang} />

      <div className="my-6 md:my-10">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <aside className="w-full shrink-0 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:w-72 xl:w-80 lg:max-h-[calc(100vh-8rem)] lg:overflow-y-auto">
            <SpoOrdersSidebar lang={lang} refreshTrigger={sidebarRefresh} />
          </aside>

          <div className="min-w-0 flex-1">
            <Link
              href={`/${lang}/special-order`}
              className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to form
            </Link>

            <div
              className="mb-8 rounded-2xl border-b-[3px] px-6 py-6 md:px-10"
              style={{
                background: 'linear-gradient(135deg, #1A1A1A 0%, #2d2d2d 100%)',
                borderColor: GOLD_ACCENT,
              }}
            >
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-white md:text-3xl">
                    {order?.ticketNumber}
                  </h1>
                  <p className="mt-1 text-sm text-slate-400">
                    {spoStatusLabel(order?.status == "FINALIZED" ? "RECEIVED" : order?.status )} · {storeName}
                  </p>
                </div>
                {order.status === 'CLOSED' && (
                  <button
                    type="button"
                    onClick={() => void handleFinalize()}
                    disabled={finalizing}
                    className="rounded-xl px-5 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity disabled:opacity-50"
                    style={{
                      background: `linear-gradient(135deg, ${GOLD_ACCENT} 0%, #a88b5c 100%)`,
                    }}
                  >
                    {finalizing ? 'Confirming…' : 'Received'}
                  </button>
                )}
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
              <div className="space-y-6">
                <div
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                >
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    Details
                  </h2>
                  <dl className="space-y-2 text-sm">
                    {[
                      ['Receipt', order?.receiptNumber],
                      ['Customer #', order?.customerNumber],
                      ['Type', order?.typeOfRequest?.replace(/_/g, ' ')],
                      ['Reference SKU', order?.referenceSkuNumber || '—'],
                      ['Metal', order?.metalQuality?.replace(/_/g, ' ')],
                      ['Diamond type', order?.diamondType?.replace(/_/g, ' ')],
                      ['Diamond color', order?.diamondColor || '—'],
                      ['Diamond clarity', order?.diamondClarity || '—'],
                      ['Diamond details', order?.diamondDetails || '—'],
                      ['Customization', order?.customization || '—'],
                      ['Notes', order?.notes || '—'],
                      [
                        'ETA',
                        order?.eta
                          ? new Date(order?.eta).toLocaleString()
                          : '—',
                      ],
                    ]?.map(([k, v]) => (
                      <div
                        key={String(k)}
                        className="flex gap-3 rounded-lg border border-slate-100 bg-slate-50/40 px-3 py-2.5"
                      >
                        <dt className="w-36 shrink-0 font-medium text-slate-500">
                          {k}
                        </dt>
                        <dd className="text-slate-800">{v}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div
                  className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm"
                  style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
                >
                  <h2 className="mb-4 text-lg font-bold text-slate-900">
                    Attachments
                  </h2>
                  {videos.length === 0 &&
                  images.length === 0 &&
                  !order.canvasDrawing ? (
                    <p className="text-sm text-slate-500">No files attached.</p>
                  ) : (
                    <div className="space-y-4">
                      {videos.map((url) => (
                        <div
                          key={url}
                          className="overflow-hidden rounded-xl bg-black"
                        >
                          <video
                            controls
                            className="max-h-64 w-full"
                            src={`${BASE_API}/uploads/${url}`}
                          />
                        </div>
                      ))}
                      <div className="flex flex-wrap gap-2">
                        {images.map((url) => (
                          <a
                            key={url}
                            href={`${BASE_API}/uploads/${url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="block overflow-hidden rounded-lg border"
                          >
                            <img
                              src={`${BASE_API}/uploads/${url}`}
                              alt=""
                              className="h-32 w-32 object-cover"
                            />
                          </a>
                        ))}
                      </div>
                      {order?.canvasDrawing ? (
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase text-slate-500">
                            Your drawing
                          </p>
                          <img
                            src={`${BASE_API}/uploads/${order.canvasDrawing}`}
                            alt="Drawing"
                            className="max-h-80 rounded-lg border object-contain"
                          />
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>

              <div
                className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:min-h-[480px] lg:max-h-[calc(100vh-10rem)]"
                style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}
              >
                <div className="border-b border-slate-200 px-4 py-4 sm:px-5">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-slate-700" />
                    <h2 className="text-base font-bold text-slate-900 sm:text-lg">
                      Track & chat
                    </h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    Send messages directly to SPO team and track progress in
                    real-time.
                  </p>
                </div>

                <div
                  ref={messagesContainerRef}
                  className="
      flex-1 space-y-3 overflow-y-auto bg-slate-50/40 p-3 sm:p-4
      min-h-[320px]
      max-h-[50vh]
      sm:max-h-[55vh]
      lg:max-h-[calc(100vh-22rem)]
    "
                >
                  {messages.length === 0 ? (
                    <div className="flex h-full min-h-[220px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-white/70 text-center">
                      <MessageSquare className="h-8 w-8 text-slate-300" />
                      <p className="mt-2 text-sm font-medium text-slate-600">
                        No messages yet
                      </p>
                      <p className="mt-1 px-4 text-xs text-slate-500">
                        Start the conversation to get updates from admin team.
                      </p>
                    </div>
                  ) : (
                    messages.map((m) => {
                      const mine = m?.role === 'user';

                      return (
                        <div
                          key={m?._id}
                          ref={(el) => {
                            messageRefs.current[String(m?._id || '')] = el;
                          }}
                          className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`w-fit max-w-[92%] sm:max-w-[85%] rounded-2xl px-3 py-2 sm:px-4 text-sm ${
                              mine
                                ? 'bg-[#6f4e37] text-white shadow-sm'
                                : 'border border-amber-200/80 bg-white text-slate-900 shadow-sm'
                            } ${
                              highlightedMessageId === String(m?._id || '')
                                ? 'ring-2 ring-amber-300'
                                : ''
                            }`}
                          >
                            <div className="mb-1 flex items-center gap-1.5">
                              {mine ? (
                                <UserCircle2 className="h-3.5 w-3.5 text-slate-300" />
                              ) : (
                                <ShieldCheck className="h-3.5 w-3.5 text-amber-700" />
                              )}
                              <p
                                className={`text-[10px] font-bold uppercase tracking-wide ${
                                  mine ? 'text-slate-300' : 'text-amber-700'
                                }`}
                              >
                                {mine ? 'You' : m?.senderName || 'Admin'}
                              </p>
                            </div>

                            {m?.replyToMessageId && m?.replyToText ? (
                              <button
                                type="button"
                                onClick={() =>
                                  jumpToMessage(m?.replyToMessageId)
                                }
                                className={`mb-2 block w-full rounded-lg border px-2.5 py-1.5 text-left ${
                                  mine
                                    ? 'border-slate-600 bg-[#EDE8D0] hover:bg-slate-800'
                                    : 'border-amber-200 bg-amber-50 hover:bg-amber-100/70'
                                }`}
                              >
                                <p className="truncate text-[11px] text-black">
                                  {m?.replyToText}
                                </p>
                              </button>
                            ) : null}

                            <p className="break-words whitespace-pre-wrap">
                              {m.text}
                            </p>

                            <div
                              className={`mt-1 flex flex-wrap items-center gap-1 text-[10px] ${
                                mine ? 'text-slate-400' : 'text-slate-500'
                              }`}
                            >
                              <Clock3 className="h-3 w-3" />
                              <span>
                                {m?.createdAt
                                  ? new Date(m?.createdAt).toLocaleString()
                                  : ''}
                              </span>
                            </div>

                            {!chatLocked ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setReplyTo({
                                    id: String(m?._id || ''),
                                    sender: mine
                                      ? 'You'
                                      : m?.senderName || 'Admin',
                                    preview: makePreview(String(m?.text || '')),
                                  })
                                }
                                className={`mt-1 text-[10px] font-semibold underline underline-offset-2 ${
                                  mine
                                    ? 'text-slate-300 hover:text-white'
                                    : 'text-amber-700 hover:text-amber-800'
                                }`}
                              >
                                Reply
                              </button>
                            ) : null}
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={listEndRef} />
                </div>

                {chatLocked ? (
                  <div className="border-t border-slate-200 bg-slate-50 px-4 py-3 text-center text-xs font-medium text-slate-600">
                    This order is finalized. Chat is now read-only.
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => void handleSend(e)}
                    className="border-t border-slate-200 bg-white p-3"
                  >
                    {replyTo ? (
                      <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold text-amber-800">
                            Replying to {replyTo?.sender}
                          </p>
                          <p className="truncate text-[11px] text-amber-700">
                            {replyTo?.preview}
                          </p>
                        </div>
                        <button
                          type="button"
                          className="shrink-0 text-[11px] font-semibold text-amber-800 hover:underline"
                          onClick={() => setReplyTo(null)}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : null}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Type your message to SPO team..."
                        className="min-w-0 flex-1 rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20"
                        maxLength={4000}
                      />
                      <button
                        type="submit"
                        disabled={sending || !chatInput.trim()}
                        className="inline-flex h-11 w-full shrink-0 items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-white disabled:opacity-50 sm:w-auto"
                        aria-label="Send"
                      >
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default SpecialOrderDetailContent;
