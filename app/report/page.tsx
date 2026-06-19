import { Suspense } from 'react';
import ReportForm from '@/components/report/ReportForm';
import { getProductById } from '@/lib/db/products';

interface ReportPageProps {
  searchParams: Promise<{
    product_id?: string;
    product_name?: string;
  }>;
}

async function ReportPageContent({ searchParams }: ReportPageProps) {
  const params = await searchParams;
  const { product_id, product_name } = params;

  let productName = product_name;
  
  // If we have a product_id but no name, fetch the product directly
  if (product_id && !productName) {
    try {
      const product = await getProductById(product_id);
      if (product) {
        productName = product.name;
      }
    } catch (error) {
      // If fetch fails, continue without name
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Report a Product</h1>
        <p className="text-gray-600">
          Help keep our community safe by reporting suspicious or counterfeit products.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <ReportForm productId={product_id} productName={productName} />
      </div>
    </main>
  );
}

export default function ReportPage(props: ReportPageProps) {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto px-4 py-12">Loading...</div>}>
      <ReportPageContent searchParams={props.searchParams} />
    </Suspense>
  );
}