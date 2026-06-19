import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import LogoutButton from '@/components/admin/LogoutButton';

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const admin = createAdminClient();

  const { count: pendingBatches } = await admin
    .from('batch_submissions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  const { count: pendingReports } = await admin
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending');

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">
            Welcome, {user?.email}
          </p>
        </div>
        <LogoutButton />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Link
          href="/admin/products"
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Products</h2>
          <p className="text-gray-600">Manage product database</p>
        </Link>

        <Link
          href="/admin/reports"
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow relative"
        >
          {(pendingReports ?? 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1">
              {pendingReports}
            </span>
          )}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Reports</h2>
          <p className="text-gray-600">Review community reports</p>
        </Link>

        <Link
          href="/admin/alerts"
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Alerts</h2>
          <p className="text-gray-600">Manage safety alerts</p>
        </Link>

        <Link
          href="/admin/batch-submissions"
          className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow relative"
        >
          {(pendingBatches ?? 0) > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full min-w-[22px] h-[22px] flex items-center justify-center px-1">
              {pendingBatches}
            </span>
          )}
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Batch Reviews</h2>
          <p className="text-gray-600">Review user-submitted batch numbers</p>
        </Link>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex gap-4">
          <Link
            href="/admin/products/new"
            className="bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700"
          >
            Add New Product
          </Link>
          <Link
            href="/"
            className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
          >
            View Public Site
          </Link>
        </div>
      </div>
    </div>
  );
}
