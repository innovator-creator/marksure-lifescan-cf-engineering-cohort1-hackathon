import type { ProductCategory } from '@/lib/types/database';

export interface AuthenticityGuide {
  category: ProductCategory;
  title: string;
  tips: string[];
}

export const authenticityGuides: Record<ProductCategory, AuthenticityGuide> = {
  medicine: {
    category: 'medicine',
    title: 'How to Verify Authentic Medicines',
    tips: [
      'Check for proper regulatory markings (FDA, NAFDAC, etc.)',
      'Verify the manufacturer\'s website and contact information',
      'Look for batch numbers and expiry dates on packaging',
      'Be suspicious of unusually low prices',
      'Purchase only from licensed pharmacies and authorized distributors',
      'Check for spelling errors on labels and packaging',
      'Verify the product\'s physical appearance against official images',
    ],
  },
  cosmetic: {
    category: 'cosmetic',
    title: 'How to Verify Authentic Cosmetics',
    tips: [
      'Check for manufacturer\'s seal or hologram on packaging',
      'Verify the product texture, color, and scent against known authentic products',
      'Look for proper ingredient listings in your language',
      'Be cautious of products sold without original packaging',
      'Check the manufacturer\'s official website for authorized sellers',
      'Verify batch codes using manufacturer\'s online tools',
      'Avoid products with missing or altered expiration dates',
    ],
  },
  food: {
    category: 'food',
    title: 'How to Verify Authentic Food Products',
    tips: [
      'Check for proper food safety certifications and seals',
      'Verify expiry dates are not tampered with',
      'Look for proper nutritional information labeling',
      'Check manufacturer\'s address and contact details',
      'Be suspicious of damaged or swollen packaging',
      'Verify the product\'s origin country matches labeling',
      'Check for proper storage condition instructions',
    ],
  },
};

export function getAuthenticityGuide(category: ProductCategory): AuthenticityGuide {
  return authenticityGuides[category] || authenticityGuides.medicine;
}
