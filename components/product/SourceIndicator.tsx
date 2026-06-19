import type { ProductSource } from '@/lib/types/database';

const SOURCE_MAP: Record<ProductSource, { label: string; text: string; color: string }> = {
  marksure: { label: 'MarkSure Verified', text: 'This product is actively monitored in the MarkSure database.', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  open_food_facts: { label: 'Open Food Facts', text: 'Data sourced from Open Food Facts. Not yet MarkSure-verified.', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  open_beauty_facts: { label: 'Open Beauty Facts', text: 'Data sourced from Open Beauty Facts. Not yet MarkSure-verified.', color: 'text-fuchsia-700 bg-fuchsia-50 border-fuchsia-200' },
  openfda: { label: 'openFDA', text: 'Data sourced from the US FDA National Drug Code Directory.', color: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
  upc_lookup: { label: 'UPC Database', text: 'Basic product info sourced from external UPC registries.', color: 'text-gray-700 bg-gray-100 border-gray-300' },
};

export default function SourceIndicator({ source }: { source: ProductSource }) {
  const config = SOURCE_MAP[source];
  if (!config) return null;

  return (
    <div className={`p-4 rounded-xl border mb-8 flex items-start gap-3 ${config.color}`}>
      <div className="text-xl">ℹ️</div>
      <div>
        <h4 className="font-semibold text-sm mb-1">{config.label}</h4>
        <p className="text-xs opacity-90">{config.text}</p>
      </div>
    </div>
  );
}
