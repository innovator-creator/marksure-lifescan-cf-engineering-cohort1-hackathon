import type { ProductCategory } from '../types/database';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  medicine: '💊 Medicine',
  cosmetic: '💄 Cosmetic',
  food: '🍎 Food',
};

export const CATEGORY_ICONS: Record<ProductCategory, string> = {
  medicine: '💊',
  cosmetic: '💄',
  food: '🍎',
};