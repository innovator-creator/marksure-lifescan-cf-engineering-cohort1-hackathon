'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Report } from '@/lib/types/database';

export default function AdminReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const response = await fetch('/api/admin/reports');
      const data = await response.json();
      setReports(data.reports || []);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (reportId: string) => {
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: reportId, status: 'reviewed' }),
      });

      if (!response.ok) throw new Error('Failed to update');
      
      setReports(reports.map(r => 
        r.id === reportId ? { ...r, status: 'reviewed' as const } : r
      ));
    } catch (error) {
      console.error('Failed to resolve report:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-teal-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Reports</h1>
        <p className="text-gray-600">Review and manage community reports</p>
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {reports.length} Reports
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : reports.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reports found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {reports.map((report) => (
              <div key={report.id} className="p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                      report.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {report.status}
                    </span>
                    {report.anonymous && (
                      <span className="ml-2 inline-block px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        Anonymous
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-900 mb-3">{report.description}</p>

                {report.image_url && (
                  <div className="mb-3">
                    <a 
                      href={report.image_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:underline"
                    >
                      View attached image
                    </a>
                  </div>
                )}

                {report.product_id && (
                  <div className="mb-3">
                    <Link 
                      href={`/product/${report.product_id}`}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      View related product
                    </Link>
                  </div>
                )}

                {report.status === 'pending' && (
                  <button
                    onClick={() => handleResolve(report.id)}
                    className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 text-sm"
                  >
                    Mark as Reviewed
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
