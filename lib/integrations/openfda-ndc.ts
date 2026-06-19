import type { Product } from '@/lib/types/database';

export async function fetchFromOpenFDA(query: { name?: string; barcode?: string }): Promise<Product | null> {
  try {
    let url = '';

    // As per Step 14, primary FDA fallback is brand name search
    if (query.name) {
      // Search both brand_name and brand_name_base to widen coverage
      url = `https://api.fda.gov/drug/ndc.json?search=brand_name_base:${encodeURIComponent(query.name)}&limit=5`;
    } else if (query.barcode) {
      // If we only have a barcode, try packaging.upc
      url = `https://api.fda.gov/drug/ndc.json?search=packaging.upc:${encodeURIComponent(query.barcode)}&limit=1`;
    } else {
      return null;
    }

    const res = await fetch(url);

    if (!res.ok) {
      // If UPC failed, try package_ndc
      if (query.barcode && !query.name) {
        const fallbackUrl = `https://api.fda.gov/drug/ndc.json?search=packaging.package_ndc:${encodeURIComponent(query.barcode)}&limit=1`;
        const fbRes = await fetch(fallbackUrl);
        if (fbRes.ok) {
          const fbData = await fbRes.json();
          if (fbData.results && fbData.results.length > 0) {
            return mapFDAResult(fbData.results[0], query);
          }
        }
      }
      return null;
    }

    const data = await res.json();

    if (!data.results || data.results.length === 0) {
      return null;
    }

    // When searching by name, pick the result with the best matching brand name.
    // Prefer results that have a brand_name (not just brand_name_base), and whose
    // name actually contains the query string (case-insensitive).
    const results: Array<Record<string, unknown>> = data.results;
    const queryLower = (query.name || '').toLowerCase();

    const best = results
      .filter((r) => {
        const bn = ((r.brand_name as string) || (r.brand_name_base as string) || '').toLowerCase();
        return bn.includes(queryLower);
      })
      .sort((a, b) => {
        // Prefer records that have a brand_name (not just brand_name_base)
        const aHasBrand = a.brand_name ? 1 : 0;
        const bHasBrand = b.brand_name ? 1 : 0;
        return bHasBrand - aHasBrand;
      })[0] ?? results[0];

    return mapFDAResult(best, query);
  } catch (error) {
    console.error('Error fetching from openFDA:', error);
    return null;
  }
}

function mapFDAResult(p: Record<string, unknown>, query: { name?: string; barcode?: string }): Product {
  // brand_name_base is a cleaner fallback than brand_name (which can include suffixes)
  const openfda = p.openfda as Record<string, unknown> | undefined;
  const manufacturerName = openfda?.manufacturer_name as string[] | undefined;
  const resolvedName =
    (p.brand_name as string) ||
    (p.brand_name_base as string) ||
    (p.generic_name as string) ||
    query.name ||
    'Unknown Medicine';

  return {
    id: crypto.randomUUID(),
    name: resolvedName,
    category: 'medicine',
    // Prefer openfda.manufacturer_name (more accurate) over labeler_name
    manufacturer:
      (manufacturerName && manufacturerName[0]) ||
      (p.labeler_name as string) ||
      null,
    manufacturer_verified: false,
    country_of_origin: 'US', // NDC is US FDA
    batch_number: null,
    expiry_date: null,
    barcode: query.barcode || null,
    qr_code: null,
    image_url: null,
    status: 'unknown',
    verified_by_authority: false,
    trust_score: 0,
    source: 'openfda',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}
