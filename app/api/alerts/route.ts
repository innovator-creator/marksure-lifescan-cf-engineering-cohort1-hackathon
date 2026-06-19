import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from('alerts')
      .select('*, products(name, image_url, category)')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw new Error(error.message);

    return NextResponse.json({ alerts: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
