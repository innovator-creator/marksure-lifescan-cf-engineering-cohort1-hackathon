'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Alert } from '@/lib/types/database';
import type { AlertType } from '@/lib/types/database';

export default function AdminAlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    type: 'general' as AlertType,
    product_id: '',
  });

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/admin/alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setFormData({ title: '', message: '', type: 'general', product_id: '' });
        setShowForm(false);
        fetchAlerts();
      }
    } catch (error) {
      console.error('Failed to create alert:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`/api/admin/alerts?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');
      
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (error) {
      console.error('Failed to delete alert:', error);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/admin" className="text-teal-600 hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Alerts</h1>
        <p className="text-gray-600">Manage safety alerts</p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
        >
          {showForm ? 'Cancel' : 'Create New Alert'}
        </button>

        {showForm && (
          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Title *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type *
              </label>
              <select
                required
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as AlertType })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="general">General</option>
                <option value="recall">Recall</option>
                <option value="counterfeit_warning">Counterfeit Warning</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product ID (Optional)
              </label>
              <input
                type="text"
                value={formData.product_id}
                onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                placeholder="Link to a specific product"
              />
            </div>

            <button
              type="submit"
              className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
            >
              Create Alert
            </button>
          </form>
        )}
      </div>

      <div className="bg-white shadow-md rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">
            {alerts.length} Admin Alerts
          </h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : alerts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No admin alerts found</div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alerts.map((alert) => (
              <div key={alert.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                    alert.type === 'recall' 
                      ? 'bg-red-100 text-red-800' 
                      : alert.type === 'counterfeit_warning'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {alert.type.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(alert.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{alert.title}</h3>
                <p className="text-sm text-gray-600 mb-3">{alert.message}</p>

                {alert.product_id && (
                  <div className="mb-3">
                    <Link 
                      href={`/product/${alert.product_id}`}
                      className="text-sm text-teal-600 hover:underline"
                    >
                      View related product
                    </Link>
                  </div>
                )}

                <button
                  onClick={() => handleDelete(alert.id)}
                  className="text-sm text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
