import { createAdminClient } from '@/lib/supabase/admin';
import { getProductById } from '@/lib/db/products';
import { getReportCount } from '@/lib/db/reports';
import { updateProductTrustScore } from '@/lib/db/reports';
import { scoreFromProduct } from './calculate';

export async function recalculateTrustScore(productId: string): Promise<number> {
  const product = await getProductById(productId);
  if (!product) {
    throw new Error('Product not found');
  }

  const reportCount = await getReportCount(productId);
  const { score, breakdown } = scoreFromProduct(product, reportCount, false);

  await updateProductTrustScore(productId, score);

  // Log history entry
  const admin = createAdminClient();
  const reason = breakdown
    .map((f) => `${f.label} (${f.points > 0 ? '+' : ''}${f.points})`)
    .join(', ');
  await admin.from('trust_score_history').insert({
    product_id: productId,
    score,
    reason,
  });

  return score;
}
