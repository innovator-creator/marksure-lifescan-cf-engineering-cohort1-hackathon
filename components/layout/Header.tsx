'use client';
import Link from 'next/link';
import { useState } from 'react';
import NotificationBell from '@/components/layout/NotificationBell';

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🛡️</span>
          <div>
            <span className="font-bold text-teal-700 text-lg leading-none block">MarkSure</span>
            <span className="text-xs text-gray-500 leading-none">LifeScan</span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link href="/" className="text-gray-600 hover:text-teal-700 transition-colors">Home</Link>
          <Link href="/scan" className="text-gray-600 hover:text-teal-700 transition-colors">Scan</Link>
          <Link href="/report" className="text-gray-600 hover:text-teal-700 transition-colors">Report</Link>
          <Link href="/alerts" className="text-gray-600 hover:text-teal-700 transition-colors">Alerts</Link>
          <NotificationBell />
          <Link href="/admin" className="bg-teal-700 text-white px-3 py-1.5 rounded-md hover:bg-teal-800 transition-colors">Admin</Link>
        </nav>

        {/* Mobile hamburger */}
        <div className="md:hidden flex items-center gap-2">
          <NotificationBell />
          <button
            className="p-2 text-gray-600"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3 text-sm font-medium">
          <Link href="/" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-teal-700">Home</Link>
          <Link href="/scan" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-teal-700">Scan</Link>
          <Link href="/report" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-teal-700">Report</Link>
          <Link href="/alerts" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-teal-700">Alerts</Link>
          <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-gray-700 hover:text-teal-700">Admin</Link>
        </div>
      )}
    </header>
  );
}