import { NextResponse } from 'next/server';
import { createReport } from '@/lib/db/reports';
import { recalculateTrustScore } from '@/lib/trust-score/recalculate';
import { uploadReportImage } from '@/lib/storage/upload';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const product_id = formData.get('product_id') as string | null;
    const description = formData.get('description') as string;
    const anonymous = formData.get('anonymous') === 'true';
    const image = formData.get('image') as File | null;

    if (!description) {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 });
    }

    let image_url: string | undefined;
    if (image) {
      const buffer = Buffer.from(await image.arrayBuffer());
      image_url = await uploadReportImage(buffer, image.name, image.type);
    }

    const report = await createReport({
      product_id: product_id || undefined,
      description,
      image_url,
      anonymous,
    });

    // Recalculate trust score if product_id was provided
    let newScore: number | undefined;
    if (product_id) {
      newScore = await recalculateTrustScore(product_id);

      // Auto-create a "comment" alert for the product
      const supabase = createServiceClient();
      const { data: product } = await supabase
        .from('products')
        .select('name, category')
        .eq('id', product_id)
        .single();

      if (product) {
        await supabase.from('alerts').insert({
          title: `New report on ${product.name}`,
          message: `A user submitted a report about "${product.name}": ${description.substring(0, 150)}`,
          type: 'comment',
          source: 'admin',
          product_id,
        });
      }
    }

    return NextResponse.json({
      success: true,
      report,
      newTrustScore: newScore,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
