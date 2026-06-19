import type { Product, ProductCategory } from '@/lib/types/database';

export async function fetchFromUPCDatabase(barcode: string, category?: ProductCategory): Promise<Product | null> {
  try {
    const apiKey = process.env.UPC_LOOKUP_API_KEY;
    
    // UPCitemDB trial endpoint
    const url = apiKey 
      ? `https://api.upcitemdb.com/prod/v1/lookup?upc=${barcode}`
      : `https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`;
      
    const headers: Record<string, string> = {};
    if (apiKey) {
      headers['user_key'] = apiKey; 
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    
    if (data.code !== 'OK' || !data.items || data.items.length === 0) {
      return null; 
    }

    const item = data.items[0];

    return {
      id: crypto.randomUUID(), 
      name: item.title || 'Unknown Product',
      category: category || 'food', 
      manufacturer: item.brand || null,
      manufacturer_verified: false,
      country_of_origin: null,
      batch_number: null,
      expiry_date: null, 
      barcode: barcode,
      qr_code: null,
      image_url: item.images && item.images.length > 0 ? item.images[0] : null,
      status: 'unknown',
      verified_by_authority: false,
      trust_score: 0, 
      source: 'upc_lookup',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error fetching from UPC DB:', error);
    return null;
  }
}
