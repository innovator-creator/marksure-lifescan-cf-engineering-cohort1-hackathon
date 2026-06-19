import { notFound } from 'next/navigation';
import { getProductById } from '@/lib/db/products';
import { getReportCount, getReportsByProductId } from '@/lib/db/reports';
import { scoreFromProduct } from '@/lib/trust-score/calculate';
import { getVerdict } from '@/lib/trust-score/verdict';
import { createAdminClient } from '@/lib/supabase/admin';

import ProductHeader from '@/components/product/ProductHeader';
import VerdictPanel from '@/components/product/VerdictPanel';
import TrustScoreBar from '@/components/product/TrustScoreBar';
import TrustScoreBreakdown from '@/components/product/TrustScoreBreakdown';
import SourceIndicator from '@/components/product/SourceIndicator';
import CommunityReports from '@/components/product/CommunityReports';
import BatchVerifyForm from '@/components/product/BatchVerifyForm';
import AuthenticityGuide from '@/components/product/AuthenticityGuide';
import ExpiryIndicators from '@/components/product/ExpiryIndicators';
import RecallCrossCheck from '@/components/product/RecallCrossCheck';
import Link from 'next/link';

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const [reportCount, reports] = await Promise.all([
    getReportCount(product.id),
    getReportsByProductId(product.id),
  ]);
  const { score, breakdown } = scoreFromProduct(product, reportCount, false);
  const verdict = getVerdict(score, product.source === 'marksure');

  // Recall cross-check: for recalled medicines, look for matching FDA alerts (PRD §7.2)
  let fdaRecallAlert: { title: string; message: string; external_ref: string | null } | null = null;
  if (product.status === 'recalled' && product.category === 'medicine') {
    const admin = createAdminClient();
    const { data: fdaAlerts } = await admin
      .from('alerts')
      .select('title, message, external_ref')
      .eq('source', 'openfda')
      .eq('type', 'recall')
      .limit(20);

    if (fdaAlerts && fdaAlerts.length > 0) {
      const nameLower = product.name.toLowerCase();
      const manuLower = product.manufacturer?.toLowerCase() ?? '';
      fdaRecallAlert =
        fdaAlerts.find(
          (a) =>
            a.title.toLowerCase().includes(nameLower) ||
            (manuLower && a.title.toLowerCase().includes(manuLower))
        ) ?? null;
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-teal-700 hover:underline mb-6">
        &larr; Back to search
      </Link>
      
      <ProductHeader product={product} />
      
      <SourceIndicator source={product.source} />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <VerdictPanel verdict={verdict} score={score} />
          <TrustScoreBar score={score} />
        </div>
        <div>
          <TrustScoreBreakdown breakdown={breakdown} />
        </div>
      </div>

      {fdaRecallAlert && (
        <RecallCrossCheck
          title={fdaRecallAlert.title}
          message={fdaRecallAlert.message}
          externalRef={fdaRecallAlert.external_ref}
        />
      )}
      
      <BatchVerifyForm productId={product.id} hasBatchOnRecord={!!product.batch_number} />

      <CommunityReports 
        count={reportCount} 
        reports={reports}
        productId={product.id}
        productName={product.name}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        <AuthenticityGuide category={product.category} />
        <ExpiryIndicators category={product.category} expiryDate={product.expiry_date} />
      </div>
    </main>
  );
}
