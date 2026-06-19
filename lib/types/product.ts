import type { Product, ProductSource } from './database';

export interface TrustScoreBreakdownItem {
  label: string;
  points: number;
}

export type TrustVerdict = 'safe' | 'warning' | 'dangerous' | 'unknown';

export interface ProductWithScore extends Product {
  breakdown: TrustScoreBreakdownItem[];
  verdict: TrustVerdict;
}

// Shape returned for external (non-MarkSure) products
export interface ExternalProduct {
  name: string;
  manufacturer: string | null;
  image_url: string | null;
  source: ProductSource;
  barcode: string | null;
  category: Product['category'];
  trust_score: number;
  verdict: TrustVerdict;
  breakdown: TrustScoreBreakdownItem[];
  status: 'unknown';
  raw: Record<string, unknown>;
}

export type LookupResult =
  | { found: true; source: 'marksure'; product: ProductWithScore }
  | { found: true; source: Exclude<ProductSource, 'marksure'>; product: ExternalProduct }
  | { found: false };