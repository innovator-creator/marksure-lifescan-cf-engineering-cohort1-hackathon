import Link from 'next/link';
import type { Alert } from '@/lib/types/database';

interface AlertCardProps {
  alert: Alert;
}

const CATEGORY_ICONS: Record<string, string> = {
  medicine: '💊',
  cosmetic: '🧴',
  food: '🍜',
};

function guessCategoryFromText(text: string): string | null {
  const lower = text.toLowerCase();
  if (lower.includes('tablet') || lower.includes('capsule') || lower.includes('drug') || lower.includes('medicine') || lower.includes('pharma') || lower.includes('paracetamol') || lower.includes('amoxicillin') || lower.includes('malaria') || lower.includes('antibiotic')) return 'medicine';
  if (lower.includes('cream') || lower.includes('lotion') || lower.includes('soap') || lower.includes('dettol') || lower.includes('nivea') || lower.includes('vaseline') || lower.includes('cosmetic') || lower.includes('bleach')) return 'cosmetic';
  if (lower.includes('noodle') || lower.includes('milk') || lower.includes('food') || lower.includes('milo') || lower.includes('oats') || lower.includes('tea') || lower.includes('honey') || lower.includes('biscuit') || lower.includes('tomato')) return 'food';
  return null;
}

function getAlertTypeConfig(type: string) {
  switch (type) {
    case 'recall':
      return { color: 'bg-red-100 text-red-800 border-red-200', icon: '🔴', label: 'RECALL' };
    case 'counterfeit_warning':
      return { color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '🟠', label: 'COUNTERFEIT WARNING' };
    case 'new_product':
      return { color: 'bg-green-100 text-green-800 border-green-200', icon: '🟢', label: 'NEW PRODUCT' };
    case 'comment':
      return { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '💬', label: 'COMMENT' };
    case 'general':
      return { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '🔵', label: 'GENERAL' };
    default:
      return { color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '⚪', label: type.toUpperCase() };
  }
}

export default function AlertCard({ alert }: AlertCardProps) {
  const typeConfig = getAlertTypeConfig(alert.type);
  const product = alert.products;
  const hasImage = product?.image_url;

  const category = product?.category || guessCategoryFromText(alert.title + ' ' + alert.message);
  const fallbackIcon = category ? CATEGORY_ICONS[category] || '📦' : '📦';

  const timeAgo = (() => {
    const seconds = Math.floor((Date.now() - new Date(alert.created_at).getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  })();

  return (
    <div className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-4">
        {hasImage && (
          <div className="shrink-0">
            <img
              src={product!.image_url!}
              alt={product?.name || alert.title}
              className="w-24 h-24 object-cover rounded-lg border border-gray-200"
            />
          </div>
        )}

        {!hasImage && (
          <div className="shrink-0 w-24 h-24 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center">
            <span className="text-3xl">{fallbackIcon}</span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start mb-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${typeConfig.color}`}>
              {typeConfig.icon} {typeConfig.label}
            </span>
            <span className="text-xs text-gray-400">
              {timeAgo}
            </span>
          </div>

          <h3 className="font-semibold text-gray-900 mb-1 text-sm">{alert.title}</h3>

          <p className="text-xs text-gray-500 line-clamp-2 mb-2">
            {alert.message}
          </p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span>{new Date(alert.created_at).toLocaleDateString()}</span>
            {alert.product_id && (
              <Link
                href={`/product/${alert.product_id}`}
                className="text-teal-600 hover:underline font-medium"
              >
                View Product →
              </Link>
            )}
            {alert.source === 'openfda' && alert.external_ref && (
              <a
                href={`https://api.fda.gov/drug/enforcement.json?search=recall_number:"${alert.external_ref}"`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-600 hover:underline"
              >
                FDA Record →
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
