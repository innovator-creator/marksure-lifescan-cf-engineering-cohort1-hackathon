import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const supabase = createServiceClient();
    const { searchParams } = new URL(request.url);
    const since = searchParams.get('since');

    let query = supabase
      .from('alerts')
      .select('*, products(name, image_url, category)')
      .order('created_at', { ascending: false })
      .limit(20);

    if (since) {
      query = query.gt('created_at', since);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);

    return NextResponse.json({ alerts: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
