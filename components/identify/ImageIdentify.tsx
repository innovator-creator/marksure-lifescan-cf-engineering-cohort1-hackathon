'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CameraCapture from './CameraCapture';

interface ProductMatch {
  productId: string;
  name: string;
  manufacturer: string | null;
  category: string;
  confidence: number;
  matchedField: 'name' | 'manufacturer';
}

export default function ImageIdentify() {
  const router = useRouter();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [matches, setMatches] = useState<ProductMatch[]>([]);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [hasAnalyzed, setHasAnalyzed] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setMatches([]);
      setExtractedText('');
      setError('');
      setHasAnalyzed(false);
    }
  };

  const handleCameraCapture = (imageData: string) => {
    const byteString = atob(imageData.split(',')[1]);
    const mimeString = imageData.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: mimeString });
    const file = new File([blob], 'camera-capture.jpg', { type: mimeString });

    setImageFile(file);
    setImagePreview(imageData);
    setMatches([]);
    setExtractedText('');
    setError('');
    setHasAnalyzed(false);
  };

  const analyzeImage = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const formData = new FormData();

      if (imageFile) {
        formData.append('image', imageFile);
      } else if (imagePreview) {
        const res = await fetch(imagePreview);
        const blob = await res.blob();
        const file = new File([blob], 'photo.jpg', { type: blob.type });
        formData.append('image', file);
      } else {
        throw new Error('No image to analyze. Please upload or capture a photo first.');
      }

      const response = await fetch('/api/identify-image', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('OCR Response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      setMatches(data.matches || []);
      setExtractedText(data.extractedText || 'No text detected');
      setHasAnalyzed(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to analyze image');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectMatch = (productId: string) => {
    router.push(`/product/${productId}`);
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview('');
    setMatches([]);
    setExtractedText('');
    setError('');
    setHasAnalyzed(false);
  };

  return (
    <div className="space-y-6">
      {!imagePreview ? (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <div className="text-gray-500 mb-2">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-teal-600 font-medium">Click to upload</span>
              <span className="text-gray-500"> or drag and drop</span>
            </label>
          </div>

          <div className="text-center text-gray-500">or</div>

          <CameraCapture onCapture={handleCameraCapture} />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-auto rounded-lg"
            />
            <button
              type="button"
              onClick={handleReset}
              className="absolute top-2 right-2 bg-gray-800 text-white p-2 rounded-full hover:bg-gray-700"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {!hasAnalyzed && !isAnalyzing && (
            <button
              type="button"
              onClick={analyzeImage}
              className="w-full bg-teal-600 text-white py-3 px-4 rounded-md hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              Analyze Image
            </button>
          )}

          {isAnalyzing && (
            <div className="text-center text-gray-600 py-4">
              Analyzing image...
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              {error}
            </div>
          )}

          {hasAnalyzed && !isAnalyzing && !error && (
            <div className="space-y-4">
              {extractedText && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Extracted Text</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">
                    {extractedText}
                  </p>
                </div>
              )}

              {matches.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold text-gray-900">
                    Did you mean?
                  </h3>
                  {matches.map((match, index) => (
                    <button
                      key={match.productId}
                      type="button"
                      onClick={() => handleSelectMatch(match.productId)}
                      className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-teal-500 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{match.name}</p>
                          {match.manufacturer && (
                            <p className="text-sm text-gray-600">{match.manufacturer}</p>
                          )}
                          <p className="text-xs text-gray-500 mt-1">
                            {match.category} &bull; {Math.round(match.confidence * 100)}% confidence
                          </p>
                        </div>
                        <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded">
                          #{index + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {matches.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800">
                  <p className="font-medium mb-2">No matching products found</p>
                  <p className="text-sm">
                    Try taking a clearer photo or search manually.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
