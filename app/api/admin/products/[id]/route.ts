import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types/database';

// GET - Fetch single product by ID
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();
    const { data, error } = await admin
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return NextResponse.json({ product: data as Product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH - Update product
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const admin = createAdminClient();

    // Build dynamic update from only the fields provided
    const updates: Record<string, unknown> = {};
    const allowedFields = [
      'name', 'category', 'manufacturer', 'manufacturer_verified',
      'country_of_origin', 'batch_number', 'expiry_date', 'barcode',
      'qr_code', 'image_url', 'status', 'verified_by_authority', 'trust_score',
    ];
    for (const field of allowedFields) {
      if (field in body) {
        updates[field] = body[field];
      }
    }

    const { data, error } = await admin
      .from('products')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Log trust score change if trust_score was updated
    if ('trust_score' in body && typeof body.trust_score === 'number') {
      await admin.from('trust_score_history').insert({
        product_id: id,
        score: body.trust_score,
        reason: `Admin update — status: ${body.status ?? 'unchanged'}`,
      });
    }

    // If admin marked as recalled, auto-create a recall alert
    if (body.status === 'recalled') {
      const { data: existingAlert } = await admin
        .from('alerts')
        .select('id')
        .eq('product_id', id)
        .eq('type', 'recall')
        .limit(1)
        .maybeSingle();

      if (!existingAlert) {
        const product = data as Product;
        await admin.from('alerts').insert({
          title: `Recall: ${product.name}`,
          message: `${product.name} has been flagged as recalled by the administrator.`,
          type: 'recall',
          source: 'admin',
          product_id: id,
        });
      }
    }

    return NextResponse.json({ product: data as Product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE - Delete product
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const admin = createAdminClient();

    const { error } = await admin
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
