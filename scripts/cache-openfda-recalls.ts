import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface FDAEnforcementRecord {
  recall_number: string;
  status: string;
  classification: string;
  product_type: string;
  recalling_firm: string;
  address_1: string;
  address_2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  voluntary_mandatory: string;
  initial_firm_notification: string;
  distribution_pattern: string;
  recall_initiation_date: string;
  report_date: string;
  reason_for_recall: string;
  product_description: string;
  code_info: string;
}

export async function cacheFDARecalls() {
  console.log('Fetching FDA enforcement records...');

  try {
    // Fetch recent FDA drug enforcement records
    const response = await fetch(
      'https://api.fda.gov/drug/enforcement.json?limit=50&sort=report_date:desc'
    );

    if (!response.ok) {
      throw new Error('Failed to fetch FDA data');
    }

    const data = await response.json();
    const records: FDAEnforcementRecord[] = data.results || [];

    console.log(`Found ${records.length} FDA enforcement records`);

    // Fetch all MarkSure products for fuzzy matching
    const { data: markSureProducts } = await supabase
      .from('products')
      .select('id, name, category');

    let upserted = 0;

    for (const record of records) {
      // Check if this recall already exists
      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('external_ref', record.recall_number)
        .single();

      if (existing) {
        console.log(`Skipping existing recall: ${record.recall_number}`);
        continue;
      }

      // Try to find a matching MarkSure product using trigram similarity
      let matchedProductId: string | null = null;
      if (markSureProducts && markSureProducts.length > 0) {
        const descLower = record.product_description.toLowerCase();
        let bestMatch = { id: '', score: 0 };

        for (const product of markSureProducts) {
          const nameLower = product.name.toLowerCase();
          // Simple word overlap scoring
          const nameWords = nameLower.split(/\s+/);
          const descWords = descLower.split(/\s+/);
          let overlap = 0;
          for (const word of nameWords) {
            if (word.length > 2 && descWords.some(dw => dw.includes(word) || word.includes(dw))) {
              overlap++;
            }
          }
          const score = overlap / Math.max(nameWords.length, 1);
          if (score > bestMatch.score && score >= 0.3) {
            bestMatch = { id: product.id, score };
          }
        }

        if (bestMatch.id) {
          matchedProductId = bestMatch.id;
          console.log(`Matched FDA recall to product: ${bestMatch.id} (score: ${bestMatch.score.toFixed(2)})`);
        }
      }

      // Insert new alert
      const { error } = await supabase.from('alerts').insert({
        title: `${record.recalling_firm} - ${record.product_description.substring(0, 100)}...`,
        message: `Reason: ${record.reason_for_recall}\nProduct: ${record.product_description}\nRecall Date: ${record.recall_initiation_date}`,
        type: 'recall',
        source: 'openfda',
        external_ref: record.recall_number,
        product_id: matchedProductId,
      });

      if (error) {
        console.error(`Failed to insert recall ${record.recall_number}:`, error);
      } else {
        upserted++;
        console.log(`Inserted recall: ${record.recall_number}`);
      }
    }

    // Backfill: try to link existing FDA alerts that have no product_id
    const { data: unlinkedAlerts } = await supabase
      .from('alerts')
      .select('id, title, message')
      .eq('source', 'openfda')
      .is('product_id', null);

    if (unlinkedAlerts && unlinkedAlerts.length > 0 && markSureProducts) {
      let linked = 0;
      for (const alert of unlinkedAlerts) {
        const text = (alert.title + ' ' + alert.message).toLowerCase();
        let bestMatch = { id: '', score: 0 };

        for (const product of markSureProducts) {
          const nameWords = product.name.toLowerCase().split(/\s+/);
          const textWords = text.split(/\s+/);
          let overlap = 0;
          for (const word of nameWords) {
            if (word.length > 2 && textWords.some(tw => tw.includes(word) || word.includes(tw))) {
              overlap++;
            }
          }
          const score = overlap / Math.max(nameWords.length, 1);
          if (score > bestMatch.score && score >= 0.4) {
            bestMatch = { id: product.id, score };
          }
        }

        if (bestMatch.id) {
          await supabase
            .from('alerts')
            .update({ product_id: bestMatch.id })
            .eq('id', alert.id);
          linked++;
        }
      }
      if (linked > 0) {
        console.log(`Backfilled ${linked} FDA alerts with product links`);
      }
    }

    console.log(`Successfully cached ${upserted} new FDA recalls`);
  } catch (error) {
    console.error('Error caching FDA recalls:', error);
    throw error;
  }
}

// Run if executed directly (tsx compatible)
const isMainModule = process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));
if (isMainModule) {
  cacheFDARecalls()
    .then(() => {
      console.log('Done!');
      process.exit(0);
    })
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
