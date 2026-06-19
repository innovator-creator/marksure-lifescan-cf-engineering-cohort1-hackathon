'use client';
import { useState } from 'react';

type BatchResult =
  | { verified: false; match: null; message: string }
  | { verified: true; match: boolean; message: string; scorePenalty: number; expected?: string; newTrustScore?: number };

interface BatchVerifyFormProps {
  productId: string;
  hasBatchOnRecord: boolean;
}

export default function BatchVerifyForm({ productId, hasBatchOnRecord }: BatchVerifyFormProps) {
  const [input, setInput] = useState('');
  const [result, setResult] = useState<BatchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Submit form state
  const [submitInput, setSubmitInput] = useState('');
  const [submitName, setSubmitName] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string } | null>(null);

  async function handleVerify() {
    if (!input.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await fetch('/api/verify-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, batch_number: input.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setResult(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!submitInput.trim()) return;
    setSubmitLoading(true);
    setSubmitResult(null);
    try {
      const res = await fetch('/api/batch-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: productId,
          batch_number: submitInput.trim(),
          submitted_by: submitName.trim() || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Submission failed');
      setSubmitResult({ success: true, message: 'Batch number submitted! Waiting for admin review.' });
      setSubmitInput('');
      setSubmitName('');
    } catch (err: unknown) {
      setSubmitResult({ success: false, message: err instanceof Error ? err.message : 'Submission failed' });
    } finally {
      setSubmitLoading(false);
    }
  }

  if (!hasBatchOnRecord) {
    return (
      <div className="border border-gray-200 rounded-2xl p-6 mb-8 bg-white">
        <h3 className="text-lg font-bold text-gray-900 mb-1">Verify Batch Number</h3>
        <p className="text-sm text-gray-500 mb-4">
          This product has no batch number on record.
        </p>

        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Submit a Batch Number</h4>
          <p className="text-xs text-gray-500 mb-3">
            Enter the batch number from your product packaging. An admin will review and verify it.
          </p>

          {submitResult && (
            <div className={`p-3 rounded-lg text-sm mb-3 ${
              submitResult.success
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {submitResult.success ? '✅ ' : '❌ '}{submitResult.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={submitInput}
              onChange={(e) => setSubmitInput(e.target.value)}
              placeholder="e.g. EM-2024-001"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={submitLoading}
            />
            <input
              type="text"
              value={submitName}
              onChange={(e) => setSubmitName(e.target.value)}
              placeholder="Your name (optional)"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
              disabled={submitLoading}
            />
            <button
              type="submit"
              disabled={!submitInput.trim() || submitLoading}
              className="w-full px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {submitLoading ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-2xl p-6 mb-8 bg-white">
      <h3 className="text-lg font-bold text-gray-900 mb-1">Verify Batch Number</h3>
      <p className="text-sm text-gray-500 mb-4">
        Enter the batch number printed on your product packaging to check authenticity.
      </p>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
          placeholder="e.g. BN-2024-001"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          onClick={handleVerify}
          disabled={!input.trim() || loading}
          className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
        >
          {loading ? 'Checking…' : 'Verify'}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {result && result.verified && (
        <div className={`p-4 rounded-xl border ${result.match
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          <div className="font-bold text-base mb-1">
            {result.match ? '✅ Batch Verified' : '❌ Batch Mismatch'}
          </div>
          <p className="text-sm">{result.message}</p>
          {!result.match && (
            <p className="text-xs mt-2 font-medium opacity-80">
              ⚠️ Trust score penalty applied: {result.scorePenalty} points
            </p>
          )}
        </div>
      )}
    </div>
  );
}
