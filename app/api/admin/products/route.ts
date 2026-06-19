import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Product } from '@/lib/types/database';

// GET - List all products
export async function GET(request: Request) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const admin = createAdminClient();
    let query = admin
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (search) {
      query = query.ilike('name', `%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ products: data as Product[] });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST - Create new product
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('products')
      .insert({
        name: body.name,
        category: body.category,
        manufacturer: body.manufacturer || null,
        manufacturer_verified: body.manufacturer_verified || false,
        country_of_origin: body.country_of_origin || null,
        batch_number: body.batch_number || null,
        expiry_date: body.expiry_date || null,
        barcode: body.barcode || null,
        qr_code: body.qr_code || null,
        image_url: body.image_url || null,
        status: body.status || 'unknown',
        verified_by_authority: body.verified_by_authority || false,
        trust_score: body.trust_score || 50,
        source: 'marksure',
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-create a "new product" alert
    await admin.from('alerts').insert({
      title: `New product added: ${data.name}`,
      message: `A new ${data.category} product "${data.name}" by ${data.manufacturer || 'Unknown'} has been added to the database.`,
      type: 'new_product',
      source: 'admin',
      product_id: data.id,
    });

    return NextResponse.json({ product: data as Product });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
