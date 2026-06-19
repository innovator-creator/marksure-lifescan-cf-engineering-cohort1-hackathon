import type { TrustVerdict } from '../types/product';

export function getVerdict(score: number, inDB: boolean): TrustVerdict {
  if (!inDB) return 'unknown';
  if (score >= 80) return 'safe';
  if (score >= 40) return 'warning';
  return 'dangerous';
}