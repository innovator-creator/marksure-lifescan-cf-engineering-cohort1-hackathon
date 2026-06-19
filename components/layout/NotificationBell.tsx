'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { Alert } from '@/lib/types/database';

const TYPE_CONFIG: Record<string, { icon: string; color: string }> = {
  recall: { icon: '🔴', color: 'text-red-600' },
  counterfeit_warning: { icon: '🟠', color: 'text-orange-600' },
  new_product: { icon: '🟢', color: 'text-green-600' },
  comment: { icon: '💬', color: 'text-yellow-600' },
  general: { icon: '🔵', color: 'text-blue-600' },
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationBell() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [newCount, setNewCount] = useState(0);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = async () => {
    try {
      const lastViewed = typeof window !== 'undefined' ? localStorage.getItem('marksure_last_viewed') : null;
      const url = lastViewed
        ? `/api/notifications?since=${encodeURIComponent(lastViewed)}`
        : '/api/notifications';
      const res = await fetch(url);
      const data = await res.json();
      const allAlerts = data.alerts || [];
      setAlerts(allAlerts.slice(0, 10));
      setNewCount(allAlerts.length);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpen = () => {
    setOpen(!open);
    if (!open) {
      localStorage.setItem('marksure_last_viewed', new Date().toISOString());
      setNewCount(0);
    }
  };

  const getAlertLink = (alert: Alert): string => {
    if (alert.product_id) return `/product/${alert.product_id}`;
    return '/alerts';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleOpen}
        className="relative p-2 text-gray-600 hover:text-teal-700 transition-colors"
        aria-label="Notifications"
      >
        <span className="text-xl">🔔</span>
        {newCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
            {newCount > 99 ? '99+' : newCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
            <Link
              href="/alerts"
              onClick={() => setOpen(false)}
              className="text-xs text-teal-600 hover:underline"
            >
              View All →
            </Link>
          </div>

          {alerts.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              No new notifications
            </div>
          ) : (
            <div className="max-h-96 overflow-y-auto divide-y divide-gray-50">
              {alerts.map((alert) => {
                const config = TYPE_CONFIG[alert.type] || TYPE_CONFIG.general;
                return (
                  <Link
                    key={alert.id}
                    href={getAlertLink(alert)}
                    onClick={() => setOpen(false)}
                    className="block px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg shrink-0 mt-0.5">{config.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 line-clamp-1">{alert.title}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">{alert.message}</p>
                        <span className="text-xs text-gray-400 mt-1 block">{timeAgo(alert.created_at)}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
