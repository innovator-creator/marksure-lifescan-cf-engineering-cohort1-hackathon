import { NextResponse } from 'next/server';
import { extractTextFromImage } from '@/lib/integrations/ocr-space';
import { fuzzyMatchProducts } from '@/lib/fuzzy-match';
import { getAllProducts } from '@/lib/db/products';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Extract text from image using OCR
    const buffer = Buffer.from(await image.arrayBuffer());
    const extractedText = await extractTextFromImage(buffer);

    // Get all products from database for fuzzy matching
    const products = await getAllProducts();

    // Perform fuzzy matching
    const matches = fuzzyMatchProducts(extractedText, products);

    return NextResponse.json({
      extractedText,
      matches: matches.map(match => ({
        productId: match.product.id,
        name: match.product.name,
        manufacturer: match.product.manufacturer,
        category: match.product.category,
        confidence: match.confidence,
        matchedField: match.matchedField,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
