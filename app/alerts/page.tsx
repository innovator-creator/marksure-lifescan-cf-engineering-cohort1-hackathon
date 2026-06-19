'use client';

import { useState, useEffect } from 'react';
import AlertCard from '@/components/alerts/AlertCard';
import type { Alert } from '@/lib/types/database';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAlerts = async () => {
    try {
      const response = await fetch('/api/alerts');
      const data = await response.json();
      setAlerts(data.alerts || []);
    } catch {
      console.error('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fdaAlerts = alerts.filter(a => a.source === 'openfda');
  const adminAlerts = alerts.filter(a => a.source === 'admin');

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Safety Alerts</h1>
        <p className="text-gray-600">
          Stay informed about product recalls and safety warnings
        </p>
      </div>

      {loading ? (
        <div className="text-center text-gray-500">Loading...</div>
      ) : (
        <div className="space-y-8">
          {fdaAlerts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Recent FDA Recall Reports (Informational)
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {fdaAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}

          {adminAlerts.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                MarkSure Alerts
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {adminAlerts.map((alert) => (
                  <AlertCard key={alert.id} alert={alert} />
                ))}
              </div>
            </section>
          )}

          {alerts.length === 0 && (
            <div className="bg-white border rounded-lg p-8 text-center text-gray-500">
              No alerts at this time
            </div>
          )}
        </div>
      )}
    </div>
  );
}
