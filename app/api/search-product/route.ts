import { NextRequest, NextResponse } from 'next/server';
import { searchProductsByName } from '@/lib/db/products';

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json([]);
  }

  try {
    const results = await searchProductsByName(q);
    return NextResponse.json(results);
  } catch (err) {
    console.error('Search error:', err);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}