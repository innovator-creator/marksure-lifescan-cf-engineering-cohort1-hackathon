import type { TrustVerdict } from '@/lib/types/product';
import { VERDICT_LABELS, VERDICT_BG, VERDICT_COLORS } from '@/lib/constants/statuses';

export default function VerdictPanel({ verdict, score }: { verdict: TrustVerdict; score: number }) {
  return (
    <div className={`p-6 rounded-2xl border mb-6 flex flex-col items-center justify-center text-center ${VERDICT_BG[verdict]}`}>
      <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500 mb-2">MarkSure Verdict</h2>
      <div className={`text-4xl font-black mb-1 ${VERDICT_COLORS[verdict]}`}>
        {VERDICT_LABELS[verdict]}
      </div>
      <p className="text-sm text-gray-600">
        Based on a trust score of {score}/100.
      </p>
    </div>
  );
}
