export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-12">
      <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-500">
        <p>🛡️ <strong className="text-teal-700">MarkSure LifeScan</strong> — Scan. Verify. Stay Safe.</p>
        <p>Data from Open Food Facts, Open Beauty Facts, OpenFDA, UPC Lookup, OCR.space &amp; MarkSure community reports.</p>
      </div>
      <div className="border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 py-3 text-center text-xs text-gray-400">
          Developed by <strong className="text-gray-500">John Mark</strong> (Innovator)
        </div>
      </div>
    </footer>
  );
}