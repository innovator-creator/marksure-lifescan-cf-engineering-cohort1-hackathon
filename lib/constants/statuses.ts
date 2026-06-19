import type { ProductStatus } from '../types/database';
import type { TrustVerdict } from '../types/product';

export const STATUS_LABELS: Record<ProductStatus, string> = {
  verified_safe: '✅ Verified Safe',
  under_review: '⚠️ Under Review',
  suspected_counterfeit: '❌ Suspected Counterfeit',
  recalled: '🚫 Recalled',
  unknown: '❓ Unknown',
};

export const STATUS_COLORS: Record<ProductStatus, string> = {
  verified_safe: 'bg-green-100 text-green-800 border-green-200',
  under_review: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  suspected_counterfeit: 'bg-red-100 text-red-800 border-red-200',
  recalled: 'bg-red-900 text-white border-red-900',
  unknown: 'bg-gray-100 text-gray-700 border-gray-200',
};

export const VERDICT_LABELS: Record<TrustVerdict, string> = {
  safe: '✅ Safe',
  warning: '⚠️ Warning',
  dangerous: '❌ Dangerous',
  unknown: '❓ Unknown',
};

export const VERDICT_COLORS: Record<TrustVerdict, string> = {
  safe: 'text-green-600',
  warning: 'text-yellow-600',
  dangerous: 'text-red-600',
  unknown: 'text-gray-500',
};

export const VERDICT_BG: Record<TrustVerdict, string> = {
  safe: 'bg-green-50 border-green-200',
  warning: 'bg-yellow-50 border-yellow-200',
  dangerous: 'bg-red-50 border-red-200',
  unknown: 'bg-gray-50 border-gray-200',
};