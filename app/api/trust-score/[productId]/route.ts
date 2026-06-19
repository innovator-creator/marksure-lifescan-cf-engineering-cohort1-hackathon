import { NextResponse } from 'next/server';
import { getProductById } from '@/lib/db/products';
import { getReportCount } from '@/lib/db/reports';
import { scoreFromProduct } from '@/lib/trust-score/calculate';
import { getVerdict } from '@/lib/trust-score/verdict';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const product = await getProductById(productId);

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const reportCount = await getReportCount(product.id);
    const { score, breakdown } = scoreFromProduct(product, reportCount, false);
    const verdict = getVerdict(score, product.source === 'marksure');

    return NextResponse.json({
      productId: product.id,
      trustScore: score,
      verdict,
      breakdown,
      reportCount,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
