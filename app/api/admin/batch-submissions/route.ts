import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

// GET - List batch submissions (admin)
export async function GET(request: Request) {
  try {
    const auth = await createClient();
    const { data: { user } } = await auth.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'pending';

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('batch_submissions')
      .select('*, products(name, category, image_url, barcode)')
      .eq('status', status)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ submissions: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH - Approve or reject a batch submission
export async function PATCH(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, action } = body;

    if (!id || !action || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json(
        { error: 'id and action (approved/rejected) are required' },
        { status: 400 }
      );
    }

    const admin = createAdminClient();

    // Get the submission
    const { data: submission, error: fetchError } = await admin
      .from('batch_submissions')
      .select('*, products(name)')
      .eq('id', id)
      .single();

    if (fetchError || !submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    // Update submission status
    const { error: updateError } = await admin
      .from('batch_submissions')
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) throw new Error(updateError.message);

    // If approved, copy batch number to the product
    if (action === 'approved') {
      const { error: productError } = await admin
        .from('products')
        .update({ batch_number: submission.batch_number })
        .eq('id', submission.product_id);

      if (productError) throw new Error(productError.message);
    }

    // Create notification alert
    const productName = submission.products?.name || 'Unknown Product';
    await admin.from('alerts').insert({
      title: `Batch submission ${action}: ${productName}`,
      message: `Batch number "${submission.batch_number}" for "${productName}" has been ${action} by admin.`,
      type: action === 'approved' ? 'new_product' : 'general',
      source: 'admin',
      product_id: submission.product_id,
    });

    return NextResponse.json({ success: true, action });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
