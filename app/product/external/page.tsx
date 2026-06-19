'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Product } from '@/lib/types/database';
import type { TrustScoreBreakdownItem, TrustVerdict } from '@/lib/types/product';

import ProductHeader from '@/components/product/ProductHeader';
import VerdictPanel from '@/components/product/VerdictPanel';
import TrustScoreBar from '@/components/product/TrustScoreBar';
import TrustScoreBreakdown from '@/components/product/TrustScoreBreakdown';
import SourceIndicator from '@/components/product/SourceIndicator';
import CommunityReports from '@/components/product/CommunityReports';
import BatchVerifyForm from '@/components/product/BatchVerifyForm';

interface EphemeralData {
  product: Product;
  trustScore: number;
  verdict: TrustVerdict;
  breakdown: TrustScoreBreakdownItem[];
}

export default function ExternalProductPage() {
  const router = useRouter();
  const [data, setData] = useState<EphemeralData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('ephemeral_product');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

  if (!data) return null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <Link href="/" className="inline-flex items-center text-sm text-teal-700 hover:underline mb-6">
        &larr; Back to search
      </Link>

      <ProductHeader product={data.product} />

      <SourceIndicator source={data.product.source} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <VerdictPanel verdict={data.verdict} score={data.trustScore} />
          <TrustScoreBar score={data.trustScore} />
        </div>
        <div>
          <TrustScoreBreakdown breakdown={data.breakdown} />
        </div>
      </div>

      <CommunityReports count={0} reports={[]} productId={data.product.id} productName={data.product.name} />

      <BatchVerifyForm productId={data.product.id} hasBatchOnRecord={!!data.product.batch_number} />
    </main>
  );
}
