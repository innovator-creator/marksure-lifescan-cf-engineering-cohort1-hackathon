import type { Product } from '@/lib/types/database';

export async function fetchFromOpenBeautyFacts(barcode: string): Promise<Product | null> {
  const userAgent = process.env.OFF_USER_AGENT || 'MarkSureLifeScan/1.0';
  
  try {
    const res = await fetch(`https://world.openbeautyfacts.org/api/v2/product/${barcode}.json`, {
      headers: {
        'User-Agent': userAgent,
      },
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    if (data.status !== 1 || !data.product) {
      return null; // Product not found
    }

    const p = data.product;

    return {
      id: crypto.randomUUID(), // Ephemeral ID for UI routing
      name: p.product_name || p.product_name_en || 'Unknown Cosmetic Product',
      category: 'cosmetic',
      manufacturer: p.brands || null,
      manufacturer_verified: false,
      country_of_origin: p.countries || null,
      batch_number: null,
      expiry_date: null,
      barcode: barcode,
      qr_code: null,
      image_url: p.image_url || null,
      status: 'unknown',
      verified_by_authority: false,
      trust_score: 0, 
      source: 'open_beauty_facts',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching from Open Beauty Facts:', error);
    return null;
  }
}
