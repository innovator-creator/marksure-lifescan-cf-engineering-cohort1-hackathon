import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/db/products';
import { getReportCount } from '@/lib/db/reports';
import { createAdminClient } from '@/lib/supabase/admin';
import { scoreFromProduct } from '@/lib/trust-score/calculate';

export async function POST(request: Request) {
  try {
    const { product_id, batch_number } = await request.json();

    if (!product_id || !batch_number) {
      return NextResponse.json(
        { error: 'product_id and batch_number are required' },
        { status: 400 }
      );
    }

    const product = await getProductById(product_id);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Product has no batch number on record — cannot verify
    if (!product.batch_number) {
      return NextResponse.json({
        verified: false,
        match: null,
        message: 'This product has no batch number on record.',
      });
    }

    const normalise = (s: string) => s.trim().toUpperCase().replace(/[\s\-]/g, '');
    const match = normalise(product.batch_number) === normalise(batch_number);

    // On mismatch: recalculate trust score with batchMismatch = true
    if (!match) {
      const count = await getReportCount(product_id);
      const { score, breakdown } = scoreFromProduct(product, count, true);

      const admin = createAdminClient();
      await admin
        .from('products')
        .update({ trust_score: score })
        .eq('id', product_id);

      const reason = breakdown
        .map((f) => `${f.label} (${f.points > 0 ? '+' : ''}${f.points})`)
        .join(', ');
      await admin.from('trust_score_history').insert({
        product_id,
        score,
        reason,
      });

      return NextResponse.json({
        verified: true,
        match: false,
        expected: product.batch_number,
        message: 'Batch number does NOT match our records. This product may be counterfeit.',
        scorePenalty: -25,
        newTrustScore: score,
      });
    }

    return NextResponse.json({
      verified: true,
      match: true,
      expected: product.batch_number,
      message: 'Batch number matches our records. This product appears authentic.',
      scorePenalty: 0,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
