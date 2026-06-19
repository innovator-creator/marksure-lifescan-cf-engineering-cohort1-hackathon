'use client';
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types/database';
import { CATEGORY_ICONS } from '@/lib/constants/categories';
import { STATUS_LABELS } from '@/lib/constants/statuses';

export default function ProductSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (query.length < 2) { setResults([]); setOpen(false); return; }

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search-product?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [query]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleSelect(product: Product) {
    setOpen(false);
    setQuery('');
    router.push(`/product/${product.id}`);
  }

  // Full external lookup via the full pipeline (FDA, Open Food Facts, etc.)
  async function handleFullLookup() {
    if (!query.trim()) return;
    setLookupLoading(true);
    setOpen(false);
    try {
      const res = await fetch('/api/lookup-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: query.trim() }),
      });
      const data = await res.json();

      if (data.found) {
        if (data.product.source === 'marksure') {
          router.push(`/product/${data.product.id}`);
        } else {
          sessionStorage.setItem('ephemeral_product', JSON.stringify({
            product: data.product,
            trustScore: data.trustScore,
            verdict: data.verdict,
            breakdown: data.breakdown,
          }));
          router.push('/product/external');
        }
      } else {
        router.push(`/product/lookup?q=${encodeURIComponent(query.trim())}`);
      }
    } catch {
      router.push(`/product/lookup?q=${encodeURIComponent(query.trim())}`);
    } finally {
      setLookupLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      handleFullLookup();
    }
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative flex gap-2">
        <div className="relative flex-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search product name (e.g. Panadol, Nivea...)"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-gray-900"
            autoComplete="off"
          />
          {loading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Searching...</span>
          )}
        </div>
        <button
          onClick={handleFullLookup}
          disabled={!query.trim() || lookupLoading}
          className="px-5 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          {lookupLoading ? 'Looking up...' : 'Search'}
        </button>
      </div>

      {open && (
        <div className="absolute z-50 w-full bg-white border border-gray-200 rounded-xl shadow-lg mt-1 max-h-80 overflow-y-auto">
          {results.length === 0 ? (
            <div className="px-4 py-3">
              <p className="text-sm text-gray-500 mb-2">No local results for &ldquo;{query}&rdquo;</p>
              <button
                onClick={handleFullLookup}
                disabled={lookupLoading}
                className="w-full text-left px-3 py-2 bg-teal-50 hover:bg-teal-100 rounded-lg text-sm text-teal-700 font-medium transition-colors"
              >
                🌐 {lookupLoading ? 'Searching external sources...' : `Search all sources for "${query}"`}
              </button>
            </div>
          ) : (
            <>
              {results.map((product) => (
                <button
                  key={product.id}
                  onClick={() => handleSelect(product)}
                  className="w-full text-left px-4 py-3 hover:bg-teal-50 border-b border-gray-100 last:border-0 transition-colors"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="text-sm font-medium text-gray-900">{product.name}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {CATEGORY_ICONS[product.category]} {product.manufacturer ?? ''}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 shrink-0">
                      {STATUS_LABELS[product.status]}
                    </span>
                  </div>
                </button>
              ))}
              <div className="px-4 py-2 border-t border-gray-100">
                <button
                  onClick={handleFullLookup}
                  disabled={lookupLoading}
                  className="text-xs text-teal-600 hover:underline"
                >
                  🌐 {lookupLoading ? 'Searching...' : 'Search external sources too'}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}