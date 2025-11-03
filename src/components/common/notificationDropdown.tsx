'use client';

import { useEffect, useRef, useState } from 'react';
import { Bell, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Utility function for conditional classes
import {
  fetchNotifications,
  readNotifications,
} from '@/framework/basic-rest/notifications/useNotifications';
import Link from 'next/link';

export default function NotificationDropdown({ lang = 'en' }: any) {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<any>(null);
  const bellRef = useRef<any>(null);
  const containerRef = useRef<any>(null);

  useEffect(() => {
    async function getNoticiations() {
      try {
        const response = await fetchNotifications(); // Replace with your API endpoint
        setNotifications(response);
        setUnreadCount(response.filter((n: any) => !n.read).length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      }
    }
    getNoticiations();
  }, []);

  useEffect(() => {
    if (isOpen && bellRef.current && dropdownRef.current) {
      const bellRect = bellRef.current.getBoundingClientRect();
      dropdownRef.current.style.top = `${bellRect.bottom + 8}px`;
      dropdownRef.current.style.right = `${window.innerWidth - bellRect.right}px`;
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: Event) {
      const target = event.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    }

    // Only add event listener when dropdown is open
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    // Cleanup event listeners
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen]);

  const markAsRead = async (id: any) => {
    try {
      await readNotifications(id);
      setNotifications((prev: any) =>
        prev.map((n: any) => (n.id === id ? { ...n, read: true } : n)),
      );
      setUnreadCount((prev) => prev - 1);
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const formatDate = (dateString: any) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: true,
    });
  };

  // console.log(notifications, 'notifications');
  // 🛠 **Filter Only Unread Notifications** (Max 3)
  let unreadNotifications = notifications
    .filter((n: any) => !n.read)
    .slice(0, 3);

  // 🚀 **If Less than 3 Unread, Fill with Latest Notifications**
  if (unreadNotifications.length < 3) {
    const remainingSlots = 3 - unreadNotifications.length;
    const latestNotifications = notifications
      .filter((n: any) => n.read) // Get read ones
      .slice(0, remainingSlots); // Fill remaining slots

    unreadNotifications = [...unreadNotifications, ...latestNotifications];
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={bellRef}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-200"
      >
        <Bell className="w-6 h-6 text-opacity-40 text-brand-dark" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          ref={dropdownRef}
          className="fixed w-80 bg-white shadow-lg rounded-lg p-3 z-50"
        >
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No new notifications</p>
          ) : (
            <ul>
              {unreadNotifications.map((notification: any) => (
                <li
                  key={notification._id}
                  className="flex flex-col p-2 border-b last:border-none"
                >
                  <span
                    className={cn(
                      'text-sm',
                      notification.read ? 'text-gray-500' : 'font-bold',
                    )}
                  >
                    {notification.content}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatDate(notification.createdAt)}
                  </span>
                  {!notification.read && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-blue-500 hover:text-blue-700 self-end"
                    >
                      <CheckCircle className="w-5 h-5" />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          <div className="w-full flex items-center">
            <Link
              href={`/${lang}/notifications/all`}
              className="text-center cursor-pointer hover:text-blue-500 w-full"
            >
              View All
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
