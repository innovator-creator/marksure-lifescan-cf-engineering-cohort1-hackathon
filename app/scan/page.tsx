import BarcodeScanner from '@/components/scan/BarcodeScanner';
import Link from 'next/link';

export default function ScanPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Scan Product</h1>
        <p className="text-gray-500">Scan a barcode or QR code to instantly verify authenticity and safety.</p>
      </div>

      <BarcodeScanner />

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm text-teal-700 hover:underline">
          &larr; Back to home
        </Link>
      </div>
    </main>
  );
}