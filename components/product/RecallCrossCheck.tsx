interface RecallCrossCheckProps {
  title: string;
  message: string;
  externalRef: string | null;
}

export default function RecallCrossCheck({ title, message, externalRef }: RecallCrossCheckProps) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-bold text-red-800 mb-2">
        🚨 FDA Recall Record Found
      </h3>
      <p className="text-sm text-red-700 mb-2">{title}</p>
      <p className="text-sm text-red-600 whitespace-pre-line mb-3">{message}</p>
      {externalRef && (
        <span className="text-xs text-red-500">
          Recall #{externalRef}
        </span>
      )}
      <p className="text-xs text-gray-500 mt-2">
        Data sourced from OpenFDA Drug Enforcement reports (informational only).
      </p>
    </div>
  );
}
