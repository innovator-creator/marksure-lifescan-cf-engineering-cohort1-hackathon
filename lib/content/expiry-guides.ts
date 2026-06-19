import type { ProductCategory } from '@/lib/types/database';

export interface ExpiryGuide {
  category: ProductCategory;
  title: string;
  information: string[];
  warningSigns: string[];
}

export const expiryGuides: Record<ProductCategory, ExpiryGuide> = {
  medicine: {
    category: 'medicine',
    title: 'Medicine Expiry Information',
    information: [
      'Expired medicines may lose effectiveness or become harmful',
      'Store medicines in cool, dry places away from direct sunlight',
      'Liquid medications typically expire faster than tablets or capsules',
      'Always check the expiration date before use',
      'Properly dispose of expired medications at designated collection points',
    ],
    warningSigns: [
      'Changes in color, texture, or smell',
      'Cracked or broken tablets/capsules',
      'Cloudy or particulate matter in liquids',
      'Damaged or compromised packaging',
      'Unusual taste when administered',
    ],
  },
  cosmetic: {
    category: 'cosmetic',
    title: 'Cosmetic Expiry Information',
    information: [
      'Cosmetics typically have PAO (Period After Opening) symbols indicating shelf life',
      'Natural and organic products often have shorter shelf lives',
      'Store cosmetics away from heat and humidity',
      'Avoid sharing products to prevent contamination',
      'Watch for changes in consistency, color, or smell',
    ],
    warningSigns: [
      'Unusual or foul odor',
      'Separation of ingredients in creams/lotions',
      'Change in color or texture',
      'Mold growth or unusual particles',
      'Skin irritation after use',
    ],
  },
  food: {
    category: 'food',
    title: 'Food Expiry Information',
    information: [
      '"Best before" dates indicate quality, not safety',
      '"Use by" dates are safety deadlines - do not consume after',
      'Store perishable items at recommended temperatures',
      'Follow FIFO (First In, First Out) for pantry management',
      'When in doubt, throw it out',
    ],
    warningSigns: [
      'Unusual or foul odors',
      'Visible mold or discoloration',
      'Changes in texture (slimy, mushy)',
      'Swollen or damaged packaging',
      'Off tastes when sampled',
    ],
  },
};

export function getExpiryGuide(category: ProductCategory): ExpiryGuide {
  return expiryGuides[category] || expiryGuides.medicine;
}
