import Link from 'next/link';
import ProductSearch from '@/components/search/ProductSearch';

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-teal-700 to-teal-900 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="text-5xl mb-4">🛡️</div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">MarkSure LifeScan</h1>
          <p className="text-teal-200 text-lg mb-8">Scan. Verify. Stay Safe.</p>
          <p className="text-teal-100 text-sm mb-8 max-w-lg mx-auto">
            Verify medicines, cosmetics, and food products for authenticity, safety, and recall status — instantly.
          </p>
          <ProductSearch />
        </div>
      </section>

      {/* Action cards */}
      <section className="max-w-5xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-4 gap-6">
        <Link href="/scan" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
          <div className="text-4xl mb-3">📷</div>
          <h2 className="font-semibold text-gray-900 group-hover:text-teal-700">Scan Barcode / QR</h2>
          <p className="text-sm text-gray-500 mt-1">Use your camera to scan a product barcode or QR code instantly.</p>
        </Link>

        <Link href="/identify" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-purple-300 transition-all group">
          <div className="text-4xl mb-3">🖼️</div>
          <h2 className="font-semibold text-gray-900 group-hover:text-purple-700">Upload Photo</h2>
          <p className="text-sm text-gray-500 mt-1">Snap or upload a photo of any product to identify it and get a trust score.</p>
        </Link>

        <Link href="/report" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
          <div className="text-4xl mb-3">🚨</div>
          <h2 className="font-semibold text-gray-900 group-hover:text-teal-700">Report a Product</h2>
          <p className="text-sm text-gray-500 mt-1">Spotted something suspicious? Report it to protect others.</p>
        </Link>

        <Link href="/alerts" className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md hover:border-teal-300 transition-all group">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="font-semibold text-gray-900 group-hover:text-teal-700">Safety Alerts</h2>
          <p className="text-sm text-gray-500 mt-1">View recalled products and official safety warnings.</p>
        </Link>
      </section>

      {/* How it works */}
      <section className="bg-white border-t border-gray-100 py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-8">How MarkSure Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-sm text-gray-600">
            <div>
              <div className="text-3xl mb-2">🔍</div>
              <strong className="block text-gray-800 mb-1">1. Search or Scan</strong>
              Type a product name or scan its barcode with your camera.
            </div>
            <div>
              <div className="text-3xl mb-2">⚙️</div>
              <strong className="block text-gray-800 mb-1">2. Instant Lookup</strong>
              We check our database, then Open Food Facts, OpenFDA, and more.
            </div>
            <div>
              <div className="text-3xl mb-2">✅</div>
              <strong className="block text-gray-800 mb-1">3. Trust Score</strong>
              Get a 0–100 safety score with a clear Safe / Warning / Dangerous verdict.
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}