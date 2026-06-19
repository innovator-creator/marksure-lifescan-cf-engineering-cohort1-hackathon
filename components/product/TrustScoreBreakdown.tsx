import type { TrustScoreBreakdownItem } from '@/lib/types/product';

export default function TrustScoreBreakdown({ breakdown }: { breakdown: TrustScoreBreakdownItem[] }) {
  return (
    <div className="mb-8">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Trust Score Breakdown</h3>
      <ul className="space-y-3">
        {breakdown.map((item, idx) => (
          <li key={idx} className="flex justify-between items-center p-3 rounded-lg border border-gray-100 bg-gray-50">
            <span className="text-gray-700 text-sm">{item.label}</span>
            <span className={`font-bold text-sm ${item.points >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {item.points >= 0 ? '+' : ''}{item.points}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
