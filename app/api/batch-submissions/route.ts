import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { product_id, batch_number, submitted_by } = body;

    if (!product_id || !batch_number) {
      return NextResponse.json(
        { error: 'product_id and batch_number are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Verify product exists
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check for duplicate pending submission
    const { data: existing } = await supabase
      .from('batch_submissions')
      .select('id')
      .eq('product_id', product_id)
      .eq('batch_number', batch_number.trim().toUpperCase())
      .eq('status', 'pending')
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        { error: 'This batch number has already been submitted and is awaiting review.' },
        { status: 409 }
      );
    }

    // Insert submission
    const { data, error } = await supabase
      .from('batch_submissions')
      .insert({
        product_id,
        batch_number: batch_number.trim().toUpperCase(),
        submitted_by: submitted_by || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw new Error(error.message);

    // Create notification alert for admin
    await supabase.from('alerts').insert({
      title: `New batch submission for ${product.name}`,
      message: `A user submitted batch number "${batch_number.trim().toUpperCase()}" for "${product.name}". Please review in the admin panel.`,
      type: 'comment',
      source: 'admin',
      product_id,
    });

    return NextResponse.json({ submission: data, success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
