'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { io } from 'socket.io-client';
import Container from '@/components/ui/container';
import Breadcrumb from '@/components/ui/breadcrumb';
import { getSocketOrigin } from '@/lib/socket-origin';
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

type Props = { lang: string; orderId: string };

export default function StoreTransferDetailContent({ lang, orderId }: Props) {
  const router = useRouter();
  const [order, setOrder] = useState<B2bStoreTransferOrder | null>(null);
  const [messages, setMessages] = useState<B2bStoChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const listEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);

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
      const saved = await postStoreTransferChatMessage(orderId, text);
      setChatInput('');
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

  const handleReceived = async () => {
    if (!orderId) return;
    setReceiving(true);
    try {
      const updated = await markStoreTransferReceived(orderId);
      setOrder(updated);
      toast.success('Marked as received');
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed');
    } finally {
      setReceiving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Breadcrumb lang={lang} />
        <p className="py-16 text-center text-slate-600">Loading…</p>
      </Container>
    );
  }

  if (!order) {
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

  return (
    <Container>
      <Breadcrumb lang={lang} />
      <div className="py-6 max-w-4xl mx-auto space-y-6">
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

        <div className="rounded-xl border border-slate-200 bg-white p-4 space-y-2 text-sm">
          <div>
            <span className="text-slate-500">Product:</span>{' '}
            <span className="font-medium">{order.vendorProductId?.title || order.vendorProductId?.vendorModel}</span>
          </div>
          <div>
            <span className="text-slate-500">SKU:</span> <span className="font-mono">{order.skuId?.sku}</span>
          </div>
          <div>
            <span className="text-slate-500">Qty:</span> {order.quantity}
          </div>
          <div>
            <span className="text-slate-500">From warehouse:</span> {order.sourceWarehouseId?.name || '—'}
          </div>
          <div>
            <span className="text-slate-500">To your store:</span> {order.destWarehouseId?.name || '—'}
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
                className={`flex ${m.role === 'admin' ? 'justify-start' : 'justify-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'admin' ? 'bg-white border border-slate-200' : 'bg-slate-900 text-white'
                  }`}
                >
                  <div className="text-xs opacity-70 mb-1">{m.senderName || m.role}</div>
                  <div className="whitespace-pre-wrap break-words">{m.text}</div>
                </div>
              </div>
            ))}
            <div ref={listEndRef} />
          </div>
          {!chatLocked ? (
            <form onSubmit={handleSend} className="p-3 border-t border-slate-200 bg-white flex gap-2">
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Write a message…"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button type="submit" loading={sending} disabled={!chatInput.trim()} className="shrink-0">
                <Send className="w-4 h-4" />
              </Button>
            </form>
          ) : (
            <div className="p-3 text-xs text-slate-500 border-t border-slate-200 bg-white">
              {order.status === 'REJECTED' ? 'This request was rejected.' : 'This request is complete.'}
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
