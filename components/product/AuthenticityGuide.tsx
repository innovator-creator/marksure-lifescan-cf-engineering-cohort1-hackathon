import { getAuthenticityGuide } from '@/lib/content/authenticity-guides';
import type { ProductCategory } from '@/lib/types/database';

interface AuthenticityGuideProps {
  category: ProductCategory;
}

export default function AuthenticityGuide({ category }: AuthenticityGuideProps) {
  const guide = getAuthenticityGuide(category);

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <h3 className="font-semibold text-blue-900 mb-4">{guide.title}</h3>
      <ul className="space-y-2">
        {guide.tips.map((tip, index) => (
          <li key={index} className="text-sm text-blue-800 flex items-start">
            <span className="mr-2">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
