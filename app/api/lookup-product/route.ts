import { NextResponse } from 'next/server';
import { findByBarcode, findByName } from '@/lib/db/products';
import { getReportCount } from '@/lib/db/reports';
import { scoreFromProduct } from '@/lib/trust-score/calculate';
import { getVerdict } from '@/lib/trust-score/verdict';
import { fetchFromOpenFoodFacts } from '@/lib/integrations/open-food-facts';
import { fetchFromOpenBeautyFacts } from '@/lib/integrations/open-beauty-facts';
import { fetchFromOpenFDA } from '@/lib/integrations/openfda-ndc';
import { fetchFromUPCDatabase } from '@/lib/integrations/upc-lookup';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { barcode, name, category } = body;

    let product = null;

    // Step 1: Search MarkSure DB first
    if (barcode) {
      product = await findByBarcode(barcode);
    }

    if (!product && name) {
      product = await findByName(name);
    }

    // Step 2: External API fallbacks — only if not found in DB

    // Open Food Facts — food category only, requires barcode
    if (!product && barcode && category === 'food') {
      product = await fetchFromOpenFoodFacts(barcode);
    }

    // Open Beauty Facts — cosmetic category only, requires barcode
    if (!product && barcode && category === 'cosmetic') {
      product = await fetchFromOpenBeautyFacts(barcode);
    }

    // openFDA NDC — medicine category only
    if (!product && category === 'medicine') {
      product = await fetchFromOpenFDA({ name, barcode });
    }

    // UPC fallback — only when barcode present and category known
    if (!product && barcode && category) {
      product = await fetchFromUPCDatabase(barcode, category);
    }

    if (!product) {
      return NextResponse.json({ found: false });
    }

    // Only fetch reports for MarkSure DB products
    const reportCount = product.source === 'marksure'
      ? await getReportCount(product.id)
      : 0;

    const hasBatchMismatch = false;

    const { score, breakdown } = scoreFromProduct(product, reportCount, hasBatchMismatch);
    const verdict = getVerdict(score, product.source === 'marksure');

    return NextResponse.json({
      found: true,
      product: {
        ...product,
        trust_score: score,
      },
      trustScore: score,
      breakdown,
      verdict,
      source: product.source,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}