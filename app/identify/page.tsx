import ImageIdentify from '@/components/identify/ImageIdentify';
import Link from 'next/link';

export default function IdentifyPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center text-sm text-teal-700 hover:underline mb-6">
          &larr; Back to search
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Identify Product from Image</h1>
        <p className="text-gray-600">
          Upload a photo or take a picture to identify a product using OCR technology.
        </p>
      </div>

      <div className="bg-white shadow-md rounded-lg p-6">
        <ImageIdentify />
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Tips for best results:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure good lighting when taking photos</li>
          <li>• Focus clearly on the product name or label</li>
          <li>• Avoid glare and reflections</li>
          <li>• Hold the camera steady</li>
        </ul>
      </div>
    </main>
  );
}
