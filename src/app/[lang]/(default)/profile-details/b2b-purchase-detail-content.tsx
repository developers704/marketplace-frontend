'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { io } from 'socket.io-client';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getSocketOrigin } from '@/lib/socket-origin';
import { getImageUrl } from '@/lib/utils';
import Image from 'next/image';
import {
  type B2BPurchaseChatMessage,
  type B2BPurchaseRequest,
  fulfillmentLabel,
  getB2BPurchaseChatMessages,
  getB2BPurchaseDetail,
  markB2BPurchaseChatSeen,
  markB2BPurchaseReceived,
  postB2BPurchaseChatMessage,
} from '@/framework/basic-rest/catalogV2/b2b-requests';
import { useUserDataQuery } from '@/framework/basic-rest/user-data/use-user-data';
import { toast } from 'react-toastify';
import { Package, Truck, CheckCircle2, Send, Paperclip, Mic, Play, CheckCheck, Check, X } from 'lucide-react';
import Button from '@components/ui/button';

const BASE_API = process.env.NEXT_PUBLIC_BASE_API || 'http://localhost:5000';

function getToken(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('auth_token') || localStorage.getItem('token') || '';
}

const CHAT_PREVIEW = 88;
const toDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
const formatDuration = (durationMs?: number) => {
  const sec = Math.max(0, Math.round((durationMs || 0) / 1000));
  const mm = Math.floor(sec / 60);
  const ss = sec % 60;
  return `${mm}:${String(ss).padStart(2, '0')}`;
};

function isImageAttachment(a: ChatAttachment): boolean {
  const mime = String(a.mimeType || '').toLowerCase();
  const url = String(a.url || '').toLowerCase();
  return mime.startsWith('image/') || url.startsWith('data:image/');
}

function isAudioAttachment(a: ChatAttachment): boolean {
  const mime = String(a.mimeType || '').toLowerCase();
  const url = String(a.url || '').toLowerCase();
  return mime.startsWith('audio/') || url.startsWith('data:audio/');
}

function effectiveFulfillment(order: B2BPurchaseRequest): string {
  const fs = order.fulfillmentStatus;
  if (fs && fs !== 'NONE') return fs;
  if (order.status === 'APPROVED') return 'SUBMITTED';
  return fs || 'NONE';
}

type ReplyCtx = { id: string; sender: string; preview: string };
type ChatAttachment = { name?: string; url: string; mimeType?: string; size?: number };
type ChatVoice = { name?: string; url: string; mimeType?: string; size?: number; durationMs?: number };

export default function B2BPurchaseDetailContent({
  lang,
  purchaseId,
}: {
  lang: string;
  purchaseId: string;
}) {
  const { data: user } = useUserDataQuery();
  const [order, setOrder] = useState<B2BPurchaseRequest | null>(null);
  const [messages, setMessages] = useState<B2BPurchaseChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [replyTo, setReplyTo] = useState<ReplyCtx | null>(null);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const [voiceNote, setVoiceNote] = useState<ChatVoice | null>(null);
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);
  const voiceStartRef = useRef<number>(0);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const listEndRef = useRef<HTMLDivElement>(null);
  const msgRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const loadAll = async () => {
    setLoading(true);
    try {
      const [o, msgs] = await Promise.all([
        getB2BPurchaseDetail(purchaseId),
        getB2BPurchaseChatMessages(purchaseId),
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
  }, [purchaseId]);

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  useEffect(() => {
    if (!purchaseId || messages.length === 0) return;
    void markB2BPurchaseChatSeen(purchaseId).catch(() => undefined);
  }, [purchaseId, messages.length]);

  useEffect(() => {
    const token = getToken();
    if (!purchaseId || !token || !order?._id) return;
    const origin = getSocketOrigin(BASE_API);
    const socket = io(origin, {
      transports: ['websocket', 'polling'],
      auth: { token },
    });
    socket.emit(
      'subscribeB2bPurchase',
      { purchaseId, orderId: purchaseId, token },
      (ack: { ok?: boolean; error?: string }) => {
        if (ack && ack.ok === false && ack.error) console.warn('B2B purchase socket:', ack.error);
      },
    );
    socket.on('b2bPurchaseChatMessage', (msg: B2BPurchaseChatMessage) => {
      setMessages((prev) => {
        if (prev.some((m) => String(m._id) === String(msg._id))) return prev;
        return [...prev, msg];
      });
      void markB2BPurchaseChatSeen(purchaseId).catch(() => undefined);
    });
    return () => {
      socket.emit('unsubscribeB2bPurchase', purchaseId);
      socket.disconnect();
    };
  }, [purchaseId, order?._id]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = chatInput.trim();
    if ((!text && attachments.length === 0 && !voiceNote) || !purchaseId) return;
    if (order?.status === 'REJECTED') return;
    setSending(true);
    try {
      const saved = await postB2BPurchaseChatMessage(
        purchaseId,
        text || '[attachment]',
        replyTo?.id || null,
        attachments,
        voiceNote,
      );
      setChatInput('');
      setReplyTo(null);
      setAttachments([]);
      setVoiceNote(null);
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

  const pickAttachments = async (evt: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(evt.target.files || []).slice(0, 4);
    if (files.length === 0) return;
    try {
      const built = await Promise.all(
        files.map(async (f) => ({
          name: f.name,
          url: await toDataUrl(f),
          mimeType: f.type || 'application/octet-stream',
          size: f.size,
        })),
      );
      setAttachments((prev) => [...prev, ...built].slice(0, 4));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Attachment failed');
    } finally {
      evt.target.value = '';
    }
  };

  const toggleVoiceRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      setRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const rec = new MediaRecorder(stream);
      recordedChunksRef.current = [];
      voiceStartRef.current = Date.now();
      rec.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) recordedChunksRef.current.push(ev.data);
      };
      rec.onstop = async () => {
        const blob = new Blob(recordedChunksRef.current, { type: rec.mimeType || 'audio/webm' });
        const file = new File([blob], `voice-${Date.now()}.webm`, { type: blob.type || 'audio/webm' });
        const url = await toDataUrl(file);
        setVoiceNote({
          name: file.name,
          url,
          mimeType: file.type || 'audio/webm',
          size: file.size,
          durationMs: Date.now() - voiceStartRef.current,
        });
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current = rec;
      rec.start();
      setRecording(true);
    } catch {
      toast.error('Mic permission required');
    }
  };

  const handleMarkReceived = async () => {
    setConfirming(true);
    try {
      const updated = await markB2BPurchaseReceived(purchaseId);
      setOrder(updated);
      toast.success('Marked as received — order completed');
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed');
    } finally {
      setConfirming(false);
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

  const messageTickState = (msg: B2BPurchaseChatMessage, index: number) => {
    if (msg.role !== 'user') return null;
    const seen = (msg.seenBy || []).some((s) => String(s.userId) !== uid);
    if (seen) return 'seen';
    const laterOppositeReply = messages.slice(index + 1).some((m) => m.role !== msg.role);
    return laterOppositeReply ? 'delivered' : 'sent';
  };

  const chatLocked = order?.status === 'REJECTED';
  const uid = user?._id ? String(user._id) : '';
  const isRequester = order && uid && String(order.requestedBy) === uid;
  const eff = order ? effectiveFulfillment(order) : 'NONE';
  const canMarkReceived =
    isRequester && order?.status === 'APPROVED' && eff === 'SHIPPED';

  const imageSrc = order?.skuId?.images?.[0] || null;
  const price = order?.cartItemPrice ?? order?.skuId?.price ?? 0;
  const currency = order?.cartItemCurrency ?? order?.skuId?.currency ?? 'USD';

  if (loading && !order) {
    return (
      <Container>
        <div className="py-20 text-center text-slate-600">Loading…</div>
      </Container>
    );
  }

  if (!order) {
    return (
      <Container>
        <p className="py-16 text-center text-slate-600">Order not found.</p>
        <div className="text-center">
          <Link href={`/${lang}/profile-details?option=Inventory Orders`} className="text-slate-900 underline">
            Back to Inventory Orders
          </Link>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <section className="my-10 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <Breadcrumb lang={lang} />
            <Link
              href={`/${lang}/profile-details?option=Inventory Orders`}
              className="mt-2 inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              ← Back to Inventory Orders
            </Link>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 md:text-3xl">
              Inventory order
            </h1>
            <p className="mt-1 font-mono text-sm text-slate-500">#{order._id.slice(-8).toUpperCase()}</p>
          </div>
          {canMarkReceived ? (
            <Button
              variant="primary"
              className="shrink-0 rounded-xl px-6 py-3 font-semibold"
              loading={confirming}
              disabled={confirming}
              onClick={() => void handleMarkReceived()}
            >
              <CheckCircle2 className="mr-2 inline h-5 w-5" />
              Mark received
            </Button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-6 sm:flex-row">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                  {imageSrc ? (
                    <Image
                      src={getImageUrl(BASE_API, imageSrc, '/assets/images/products/item1.png')}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="112px"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-10 w-10 text-slate-300" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-lg font-semibold text-slate-900">{order.vendorProductId?.title || '—'}</h2>
                  <p className="text-sm text-slate-600">{order.vendorProductId?.vendorModel}</p>
                  <p className="mt-2 text-sm text-slate-600">
                    <span className="font-mono">{order.skuId?.sku}</span>
                    {' · '}
                    Qty {order.quantity}
                  </p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {currency}{' '}
                    {(price * order.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">{order.storeWarehouseId?.name}</p>
                </div>
              </div>
            </div>
            <div className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm lg:min-h-[520px]">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="font-semibold text-slate-900">Messages</h3>
              <p className="text-xs text-slate-500">Chat with the admin team</p>
            </div>
            <div className="max-h-[min(55vh,480px)] flex-1 overflow-y-auto px-3 py-3">
              {messages.length === 0 ? (
                <p className="py-8 text-center text-sm text-slate-500">No messages yet.</p>
              ) : (
                messages.map((m, idx) => (
                  <div
                    key={m._id}
                    ref={(el) => {
                      msgRefs.current[String(m._id)] = el;
                    }}
                    className={`mb-3 flex items-end gap-2 ${m.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                  >
                    {m.role !== 'admin' ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-[11px] font-semibold text-slate-700">
                        {(m.senderName || 'U').slice(0, 1).toUpperCase()}
                      </div>
                    ) : null}
                    <div
                      className={`w-full max-w-[78%] rounded-2xl border px-3 py-2 text-sm ${
                        m.role === 'admin'
                          ? 'border-pink-200 bg-[#6f4e37] text-white'
                          : 'border-slate-200 bg-[#EDE8D0] text-slate-900'
                      }`}
                    >
                      <div className={`text-[11px] ${m.role === 'admin' ? 'text-white' : 'opacity-70'}`}>
                        {m.senderName || m.role}
                      </div>
                    {m.replyToMessageId && m.replyToText ? (
                      <button
                        type="button"
                        className={`mt-2 w-full rounded-lg border p-2 text-left text-xs ${
                          m.role === 'admin' ? 'border-pink-200 bg-[#EDE8D0] text-black' : 'border-slate-200 bg-slate-50 text-slate-600'
                        }`}
                        onClick={() => jumpTo(m.replyToMessageId)}
                      >
                        <span className="font-semibold">Reply to {m.replyToSenderName || 'message'}</span>
                        <div className="truncate opacity-100">{m.replyToText}</div>
                      </button>
                    ) : null}
                    {Array.isArray(m.attachments) && m.attachments.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {m.attachments.map((a, idx) => (
                          isImageAttachment(a) ? (
                      <div
                        key={`${a.url}-${idx}`}
                        className="w-[160px] max-w-[55vw] overflow-hidden rounded-xl border border-white/40 sm:w-[190px] md:w-[220px]"
                      >
                        <Image
                          src={a.url}
                          alt={a.name || `attachment-${idx + 1}`}
                          width={220}
                          height={220}
                          className="h-auto w-full object-contain"
                          sizes="(max-width: 640px) 55vw, 220px"
                        />
                      </div>
                            // <img
                            //   key={`${a.url}-${idx}`}
                            //   src={a.url}
                            //   alt={a.name || `attachment-${idx + 1}`}
                            //   className="max-h-96 w-full rounded-xl border border-white/40 object-fill"
                            // />
                          ) : isAudioAttachment(a) ? (
                            <audio key={`${a.url}-${idx}`} controls src={a.url} className="w-full" />
                          ) : (
                            <a
                              key={`${a.url}-${idx}`}
                              href={a.url}
                              download={a.name || `attachment-${idx + 1}`}
                              className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] ${
                                m.role === 'admin'
                                  ? 'border-white/40 bg-pink-300 text-white'
                                  : 'border-slate-200 bg-white text-slate-700'
                              }`}
                            >
                              <Paperclip className="h-3 w-3" />
                              {a.name || `Attachment ${idx + 1}`}
                            </a>
                          )
                        ))}
                      </div>
                    ) : null}
                    {m.voice?.url ? <audio controls src={m.voice.url} className="mt-2 w-full" /> : null}
                    {m.text !== '[attachment]' ? <div className="mt-1 whitespace-pre-wrap">{m.text}</div> : null}
                    {!chatLocked ? (
                      <button
                        type="button"
                        className={`mt-2 text-xs font-medium ${m.role === 'admin' ? 'text-white/90' : 'text-[#6f4e37]'} hover:opacity-80`}
                        onClick={() =>
                          setReplyTo({
                            id: String(m._id),
                            sender: m.role === 'admin' ? m.senderName || 'Admin' : 'You',
                            preview: makePreview(m.text || ''),
                          })
                        }
                      >
                        Reply
                      </button>
                    ) : null}
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${m.role === 'admin' ? 'text-pink-50/90' : 'text-slate-500'}`}>
                      {m.createdAt ? <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span> : null}
                      {m.role === 'user' ? (
                        (() => {
                          const tick = messageTickState(m, idx);
                          if (tick === 'sent') return <Check className="h-3 w-3" />;
                          if (tick === 'delivered') return <CheckCheck className="h-3 w-3" />;
                          return <CheckCheck className="h-3 w-3 text-sky-400" />;
                        })()
                      ) : null}
                    </div>
                    </div>
                    {m.role === 'admin' ? (
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EDE8D0] text-[11px] font-semibold text-[#6f4e37]">
                        {(m.senderName || 'A').slice(0, 1).toUpperCase()}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
              <div ref={listEndRef} />
            </div>
            {!chatLocked ? (
              <form onSubmit={handleSend} className="border-t border-slate-100 p-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx,.txt,audio/*"
                  multiple
                  onChange={pickAttachments}
                />
                {replyTo ? (
                  <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-amber-100 bg-amber-50 p-2 text-xs">
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-800">Replying to {replyTo.sender}</span>
                      <div className="truncate text-slate-600">&quot;{replyTo.preview}&quot;</div>
                    </div>
                    <button type="button" className="shrink-0 text-slate-600 hover:text-slate-900" onClick={() => setReplyTo(null)}>
                      ✕
                    </button>
                  </div>
                ) : null}
                {attachments.length > 0 ? (
                  <div className="mb-2 flex flex-wrap gap-2">
                    {attachments?.map((a, idx) => (
                      <span
                        key={`${a?.url}-${idx}`}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[11px]"
                      >
                        <Paperclip className="h-3 w-3" />
                        {a?.name}
                        <button type="button" onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}>
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                ) : null}
                {voiceNote ? (
                  <div className="mb-2 flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-xs">
                    <span className="inline-flex items-center gap-1">
                      <Play className="h-3 w-3" />
                      Voice note ({formatDuration(voiceNote.durationMs)})
                    </span>
                    <button type="button" className="text-slate-600" onClick={() => setVoiceNote(null)}>
                      Remove
                    </button>
                  </div>
                ) : null}
                <div className="flex gap-2">
                  <textarea
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="Write a message…"
                  rows={2}
                  maxLength={4000}
                  className="min-h-[44px] flex-1 resize-none rounded-xl border border-slate-200 bg-[#fbf7ef] px-3 py-2 text-sm focus:border-[#6f4e37] focus:outline-none"
                />

                <button
                  type="button"
                  className="lux-chat-btn"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Paperclip className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  className={`lux-chat-btn ${recording ? 'lux-chat-btn-recording' : ''}`}
                  onClick={() => void toggleVoiceRecording()}
                >
                  <Mic className="h-5 w-5" />
                </button>

               <button
                type="submit"
                className="lux-chat-btn"
                disabled={(!chatInput.trim() && attachments.length === 0 && !voiceNote) || sending}
              >
                {sending ? '…' : <Send className="h-5 w-5" />}
              </button>
                </div>
              </form>
            ) : (
              <div className="border-t border-slate-100 p-3 text-center text-xs text-slate-500">Chat closed (rejected).</div>
            )}
          </div>
            
          </div>
              {order.status === 'APPROVED' ? (
              <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/40 p-6">
                <h3 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-emerald-900">
                  <Truck className="h-4 w-4" />
                  Shipping status
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(['SUBMITTED', 'IN_PROCESS', 'SHIPPED', 'COMPLETED'] as const).map((step) => {
                    const orderFlow = ['SUBMITTED', 'IN_PROCESS', 'SHIPPED', 'COMPLETED'];
                    const idx = orderFlow.indexOf(eff);
                    const stepIdx = orderFlow.indexOf(step);
                    const active = stepIdx <= idx && eff !== 'NONE';
                    const current = step === eff;
                    return (
                      <span
                        key={step}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          current
                            ? 'bg-emerald-600 text-white'
                            : active
                              ? 'bg-emerald-200 text-emerald-900'
                              : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {fulfillmentLabel(step)}
                      </span>
                    );
                  })}
                </div>
                {eff === 'SHIPPED' && isRequester ? (
                  <p className="mt-4 text-sm text-emerald-800">
                    Your order is on the way. Confirm receipt when it arrives at your store.
                  </p>
                ) : null}
                {eff === 'COMPLETED' ? (
                  <p className="mt-4 text-sm font-medium text-emerald-800">
                    Completed
                    {order.completedAt ? ` · ${new Date(order.completedAt).toLocaleString()}` : ''}
                  </p>
                ) : null}
              </div>
            ) : null}
          
        </div>
      </section>
    <style jsx>{`
  .lux-chat-btn {
    width: 42px;
    height: 42px;
    min-width: 42px;
    align-self: flex-end;
    border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.35);
    background: linear-gradient(145deg, #7b563d, #4b2f20);
    color: #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 18px rgba(111, 78, 55, 0.28);
    transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
  }

  .lux-chat-btn:hover {
    transform: translateY(-2px) scale(1.08);
    box-shadow: 0 12px 24px rgba(111, 78, 55, 0.38);
  }

  .lux-chat-btn:active {
    transform: scale(0.94);
  }

  .lux-chat-btn svg {
    transition: transform 0.18s ease;
  }

  .lux-chat-btn:hover svg {
    transform: scale(1.18);
  }

  .lux-chat-btn:disabled {
    opacity: 0.55;
    cursor: not-allowed;
    transform: none;
  }

  .lux-chat-btn-recording {
    background: linear-gradient(145deg, #dc2626, #7f1d1d);
    animation: micPulse 1s infinite;
  }

  @keyframes micPulse {
    0% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0.45); }
    70% { box-shadow: 0 0 0 10px rgba(220, 38, 38, 0); }
    100% { box-shadow: 0 0 0 0 rgba(220, 38, 38, 0); }
  }
  .lux-chat-btn {
  width: 42px;
  height: 42px;
  min-width: 42px;
  padding: 0;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.35);
  background: linear-gradient(145deg, #7b563d, #4b2f20);
  color: #fff;
}
`}
</style>
    </Container>
    
  );
}
 