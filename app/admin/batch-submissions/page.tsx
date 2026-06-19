'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Submission {
  id: string;
  product_id: string;
  batch_number: string;
  submitted_by: string | null;
  status: string;
  created_at: string;
  products: {
    name: string;
    category: string;
    image_url: string | null;
    barcode: string | null;
  } | null;
}

export default function AdminBatchSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');

  const fetchSubmissions = async (status: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/batch-submissions?status=${status}`);
      const data = await response.json();
      setSubmissions(data.submissions || []);
    } catch (error) {
      console.error('Failed to fetch submissions:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(filter);
  }, [filter]);

  const handleAction = async (id: string, action: 'approved' | 'rejected') => {
    try {
      const response = await fetch('/api/admin/batch-submissions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });

      if (!response.ok) throw new Error('Failed to update');

      setSubmissions(submissions.filter((s) => s.id !== id));
    } catch (error) {
      console.error('Failed to process submission:', error);
    }
  };

  const CATEGORY_ICON: Record<string, string> = {
    medicine: '💊',
    cosmetic: '🧴',
    food: '🍜',
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-teal-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Batch Submissions</h1>
        <p className="text-gray-600">Review and approve user-submitted batch numbers</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {(['pending', 'approved', 'rejected'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === status
                ? 'bg-teal-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white shadow-md rounded-lg">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No {filter} batch submissions
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {submissions.map((sub) => (
              <div key={sub.id} className="p-4 flex items-center gap-4">
                {/* Product image or category icon */}
                <div className="shrink-0 w-16 h-16 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden">
                  {sub.products?.image_url ? (
                    <img
                      src={sub.products.image_url}
                      alt={sub.products.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">
                      {CATEGORY_ICON[sub.products?.category || ''] || '📦'}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm">
                    {sub.products?.name || 'Unknown Product'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Batch: <span className="font-mono font-medium text-gray-700">{sub.batch_number}</span>
                  </p>
                  {sub.submitted_by && (
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted by: {sub.submitted_by}
                    </p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(sub.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Actions */}
                {filter === 'pending' && (
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleAction(sub.id, 'approved')}
                      className="px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleAction(sub.id, 'rejected')}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700 transition-colors"
                    >
                      ❌ Reject
                    </button>
                  </div>
                )}

                {filter !== 'pending' && (
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      filter === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {filter === 'approved' ? 'Approved' : 'Rejected'}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
