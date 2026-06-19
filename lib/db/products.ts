import { createServiceClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types/database';

export async function searchProductsByName(query: string): Promise<Product[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, status, trust_score, image_url, manufacturer, source')
    .ilike('name', `%${query}%`)
    .order('trust_score', { ascending: false })
    .limit(10);

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getAllProducts(): Promise<Product[]> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('id, name, category, status, trust_score, image_url, manufacturer, source')
    .order('trust_score', { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as Product[];
}

export async function getProductById(id: string): Promise<Product | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data as Product;
}

export async function findByBarcode(barcode: string): Promise<Product | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('barcode', barcode)
    .single();

  if (error) return null;
  return data as Product;
}

export async function findByName(name: string): Promise<Product | null> {
  const supabase = createServiceClient();
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .ilike('name', name)
    .single();

  if (error) return null;
  return data as Product;
}