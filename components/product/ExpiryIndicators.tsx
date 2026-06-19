import { getExpiryGuide } from '@/lib/content/expiry-guides';
import type { ProductCategory } from '@/lib/types/database';

interface ExpiryIndicatorsProps {
  category: ProductCategory;
  expiryDate: string | null;
}

export default function ExpiryIndicators({ category, expiryDate }: ExpiryIndicatorsProps) {
  const guide = getExpiryGuide(category);

  const now = new Date();
  const isExpired = expiryDate ? new Date(expiryDate) < now : false;
  const isNearExpiry = expiryDate ? 
    new Date(expiryDate) < new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) : false;

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-yellow-900">{guide.title}</h3>
        {expiryDate && (
          <span className={`text-sm font-medium ${
            isExpired ? 'text-red-600' : isNearExpiry ? 'text-orange-600' : 'text-green-600'
          }`}>
            {isExpired ? 'EXPIRED' : isNearExpiry ? 'EXPIRING SOON' : 'VALID'}
          </span>
        )}
      </div>

      {expiryDate && (
        <div className="mb-4">
          <p className="text-sm text-yellow-800">
            Expiry Date: <span className="font-medium">{new Date(expiryDate).toLocaleDateString()}</span>
          </p>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <h4 className="font-medium text-yellow-900 mb-2">Important Information</h4>
          <ul className="space-y-1">
            {guide.information.map((info, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2">•</span>
                <span>{info}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-medium text-yellow-900 mb-2">Warning Signs</h4>
          <ul className="space-y-1">
            {guide.warningSigns.map((sign, index) => (
              <li key={index} className="text-sm text-yellow-800 flex items-start">
                <span className="mr-2">⚠</span>
                <span>{sign}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
