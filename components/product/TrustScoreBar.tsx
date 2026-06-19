export default function TrustScoreBar({ score }: { score: number }) {
  let color = 'bg-gray-400';
  if (score >= 80) color = 'bg-green-500';
  else if (score >= 40) color = 'bg-yellow-500';
  else color = 'bg-red-500';

  return (
    <div className="mb-6">
      <div className="flex justify-between text-xs text-gray-500 font-medium mb-1">
        <span>0</span>
        <span>100</span>
      </div>
      <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden flex">
        <div 
          className={`h-full ${color} transition-all duration-1000 ease-out`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}
