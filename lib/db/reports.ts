import { createAdminClient } from '@/lib/supabase/admin';
import type { Report } from '@/lib/types/database';

export async function getReportCount(productId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('product_id', productId);

  if (error) return 0;
  return count || 0;
}

export async function getReportsByProductId(productId: string): Promise<Report[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from('reports')
    .select('id, description, anonymous, status, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) return [];
  return (data ?? []) as Report[];
}

export async function createReport(data: {
  product_id?: string;
  description: string;
  image_url?: string;
  anonymous: boolean;
}): Promise<Report> {
  const supabase = createAdminClient();
  
  const { data: report, error } = await supabase
    .from('reports')
    .insert({
      product_id: data.product_id || null,
      description: data.description,
      image_url: data.image_url || null,
      anonymous: data.anonymous,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return report as Report;
}

export async function updateProductTrustScore(
  productId: string,
  newScore: number
): Promise<void> {
  const supabase = createAdminClient();
  
  const { error } = await supabase
    .from('products')
    .update({ trust_score: newScore })
    .eq('id', productId);

  if (error) throw new Error(error.message);
}
