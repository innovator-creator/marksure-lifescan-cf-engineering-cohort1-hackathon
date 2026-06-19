'use client';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function LookupContent() {
  const searchParams = useSearchParams();
  const barcode = searchParams.get('barcode');

  return (
    <div className="text-center max-w-lg mx-auto bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
      <div className="text-5xl mb-4">❓</div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
      <p className="text-gray-600 mb-6">
        We searched the MarkSure database and all external safety networks, but couldn&apos;t find a record for {barcode ? `barcode "${barcode}"` : 'this product'}.
      </p>
      
      <div className="flex flex-col gap-3">
        <Link 
          href={`/report${barcode ? `?barcode=${barcode}` : ''}`} 
          className="w-full bg-teal-600 text-white font-semibold py-3 rounded-xl hover:bg-teal-700 transition-colors inline-block"
        >
          Submit a Report
        </Link>
        <Link 
          href="/scan" 
          className="w-full bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-colors inline-block"
        >
          Scan Another Product
        </Link>
      </div>
    </div>
  );
}

export default function LookupPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <Suspense fallback={<div className="text-center text-gray-500">Loading...</div>}>
        <LookupContent />
      </Suspense>
    </main>
  );
}
