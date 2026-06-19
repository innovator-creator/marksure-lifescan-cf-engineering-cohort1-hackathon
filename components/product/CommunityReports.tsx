import Link from 'next/link';
import type { Report } from '@/lib/types/database';

interface CommunityReportsProps {
  count: number;
  reports: Report[];
  productId: string;
  productName: string;
}

export default function CommunityReports({ count, reports, productId, productName }: CommunityReportsProps) {
  return (
    <div className="border-t border-gray-200 pt-8 mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-2 text-center">Community Reports</h3>
      <p className="text-gray-600 text-sm mb-4 text-center">
        {count === 0 
          ? "No suspicious activity or adverse effects reported for this product." 
          : `There ${count === 1 ? 'is' : 'are'} ${count} ${count === 1 ? 'report' : 'reports'} from the community regarding this product.`}
      </p>

      {reports.length > 0 && (
        <div className="space-y-3 mb-6">
          {reports.map((report) => (
            <div key={report.id} className="bg-gray-50 border border-gray-100 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                  report.status === 'pending' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {report.status}
                </span>
                {report.anonymous && (
                  <span className="text-xs text-gray-500">Anonymous</span>
                )}
                <span className="text-xs text-gray-400 ml-auto">
                  {new Date(report.created_at).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-700">{report.description}</p>
            </div>
          ))}
        </div>
      )}

      <div className="text-center">
        <Link 
          href={`/report?product_id=${productId}&product_name=${encodeURIComponent(productName)}`}
          className="inline-block px-6 py-2 bg-white border-2 border-red-100 text-red-600 rounded-lg text-sm font-bold hover:bg-red-50 transition-colors"
        >
          🚨 Report this product
        </Link>
      </div>
    </div>
  );
}
