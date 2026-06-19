import type { Product } from '../types/database';
import type { TrustScoreBreakdownItem } from '../types/product';

interface ScoreInput {
  inMarkSureDB: boolean;
  adminVerified: boolean; // verified_by_authority = true
  hasValidBarcode: boolean;
  reportCount: number;
  batchMismatch: boolean;
}

export function calculateTrustScore(input: ScoreInput): {
  score: number;
  breakdown: TrustScoreBreakdownItem[];
} {
  const breakdown: TrustScoreBreakdownItem[] = [];
  let score = 0;

  if (!input.inMarkSureDB) {
    score -= 40;
    breakdown.push({ label: 'Not found in MarkSure database', points: -40 });
    return { score: Math.max(0, score), breakdown };
  }

  breakdown.push({ label: 'Found in MarkSure database', points: 25 });
  score += 25;

  if (input.adminVerified) {
    breakdown.push({ label: 'Verified by authority', points: 40 });
    score += 40;
  }

  if (input.hasValidBarcode) {
    breakdown.push({ label: 'Valid barcode/QR format', points: 10 });
    score += 10;
  }

  if (input.reportCount === 0) {
    breakdown.push({ label: 'No community reports', points: 15 });
    score += 15;
  } else {
    const penalty = input.reportCount * 10;
    breakdown.push({
      label: `Community reports filed (${input.reportCount})`,
      points: -penalty,
    });
    score -= penalty;
  }

  if (input.batchMismatch) {
    breakdown.push({ label: 'Invalid batch number', points: -25 });
    score -= 25;
  }

  return { score: Math.max(0, Math.min(100, score)), breakdown };
}

export function scoreFromProduct(
  product: Pick<Product, 'verified_by_authority' | 'barcode' | 'status' | 'source'>,
  reportCount: number,
  batchMismatch = false
) {
  return calculateTrustScore({
    inMarkSureDB: product.source === 'marksure',
    adminVerified: product.verified_by_authority,
    hasValidBarcode: !!product.barcode && product.barcode.length >= 8,
    reportCount,
    batchMismatch,
  });
}