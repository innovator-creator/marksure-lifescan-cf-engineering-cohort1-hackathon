'use client';
import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { useRouter } from 'next/navigation';

export default function BarcodeScanner() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [manualBarcode, setManualBarcode] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasScannedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let scanner: Html5QrcodeScanner | null = null;

    try {
      scanner = new Html5QrcodeScanner(
        'reader',
        { fps: 10, qrbox: { width: 250, height: 250 }, rememberLastUsedCamera: true },
        false
      );
      scannerRef.current = scanner;

      scanner.render(
        async (decodedText) => {
          if (hasScannedRef.current) return;
          hasScannedRef.current = true;

          try {
            await scanner!.clear();
          } catch {
            // safe to ignore
          }

          handleBarcodeScanned(decodedText);
        },
        () => {
          if (!cameraReady) setCameraReady(true);
        }
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to start camera';
      setError(`Camera error: ${msg}. You can enter a barcode manually below.`);
      setCameraReady(true);
    }

    return () => {
      if (scannerRef.current) {
        try {
          scannerRef.current.clear().catch(() => {});
        } catch {
          // intentionally swallowed
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function lookupWithCategory(barcode: string, category: string) {
    const res = await fetch('/api/lookup-product', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ barcode, category }),
    });
    return res.json();
  }

  async function handleBarcodeScanned(barcode: string) {
    setScanning(true);
    setError(null);

    try {
      // Try all three categories in order
      const categories = ['food', 'cosmetic', 'medicine'];
      let data = null;

      for (const category of categories) {
        const result = await lookupWithCategory(barcode, category);
        if (result.found) {
          data = result;
          break;
        }
      }

      if (data && data.found && data.product?.id) {
        if (data.product.source === 'marksure') {
          router.push(`/product/${data.product.id}`);
        } else {
          sessionStorage.setItem('ephemeral_product', JSON.stringify({
            product: data.product,
            trustScore: data.trustScore,
            verdict: data.verdict,
            breakdown: data.breakdown,
          }));
          router.push('/product/external');
        }
      } else {
        router.push(`/product/lookup?barcode=${encodeURIComponent(barcode)}`);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error looking up barcode');
      setScanning(false);
      hasScannedRef.current = false;
    }
  }

  function handleManualSubmit(e: React.FormEvent) {
    e.preventDefault();
    const val = manualBarcode.trim();
    if (!val) return;

    if (/[a-zA-Z]/.test(val) && val.length < 13) {
      setError('That looks like a batch number, not a barcode. Barcodes are usually 8–13 digits (numbers only).');
      return;
    }
    setError(null);
    handleBarcodeScanned(val);
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div id="reader" className="w-full" />
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
          {error}
        </div>
      )}

      {scanning && (
        <div className="mt-4 p-3 bg-teal-50 text-teal-700 text-sm rounded-lg border border-teal-200 text-center">
          Looking up product across all databases…
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500 mb-1 text-center font-medium">
          Can&apos;t scan? Enter barcode manually:
        </p>
        <p className="text-xs text-gray-400 mb-3 text-center">
          Use the numeric barcode (e.g. 6934567890123) &mdash; not the batch number.
        </p>
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <input
            type="text"
            value={manualBarcode}
            onChange={(e) => setManualBarcode(e.target.value)}
            placeholder="e.g. 6934567890123"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            disabled={scanning}
          />
          <button
            type="submit"
            disabled={scanning || !manualBarcode.trim()}
            className="px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Lookup
          </button>
        </form>
      </div>
    </div>
  );
}