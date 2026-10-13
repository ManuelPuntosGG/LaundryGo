export interface PricingTier {
  tier: number;
  label: string;
  minSqft: number;
  maxSqft: number;
  standardPrice: number;
  deepPrice: number;
  strOnSitePrice: number;
  strOffSitePrice: number;
  sqftEquivalent: string;
  propertyHint: string;
  isCustomQuote?: boolean;
}

export type CleaningServiceTierType = 'standard' | 'deep' | 'str_on_site' | 'str_off_site';

export const PRICING_TIERS: PricingTier[] = [
  { tier: 0, label: '500 – 999 sq ft', minSqft: 500, maxSqft: 999, standardPrice: 155, deepPrice: 235, strOnSitePrice: 205, strOffSitePrice: 270, sqftEquivalent: '500 – 999 sq ft', propertyHint: '500 – 999 sq ft' },
  { tier: 1, label: '1,000 – 1,299 sq ft', minSqft: 1000, maxSqft: 1299, standardPrice: 175, deepPrice: 270, strOnSitePrice: 230, strOffSitePrice: 310, sqftEquivalent: '1,000 – 1,299 sq ft', propertyHint: '1,000 – 1,299 sq ft' },
  { tier: 2, label: '1,300 – 1,599 sq ft', minSqft: 1300, maxSqft: 1599, standardPrice: 190, deepPrice: 295, strOnSitePrice: 255, strOffSitePrice: 340, sqftEquivalent: '1,300 – 1,599 sq ft', propertyHint: '1,300 – 1,599 sq ft' },
  { tier: 3, label: '1,600 – 1,899 sq ft', minSqft: 1600, maxSqft: 1899, standardPrice: 200, deepPrice: 320, strOnSitePrice: 270, strOffSitePrice: 370, sqftEquivalent: '1,600 – 1,899 sq ft', propertyHint: '1,600 – 1,899 sq ft' },
  { tier: 4, label: '1,900 – 2,199 sq ft', minSqft: 1900, maxSqft: 2199, standardPrice: 215, deepPrice: 360, strOnSitePrice: 300, strOffSitePrice: 420, sqftEquivalent: '1,900 – 2,199 sq ft', propertyHint: '1,900 – 2,199 sq ft' },
  { tier: 5, label: '2,200 – 2,499 sq ft', minSqft: 2200, maxSqft: 2499, standardPrice: 230, deepPrice: 410, strOnSitePrice: 340, strOffSitePrice: 480, sqftEquivalent: '2,200 – 2,499 sq ft', propertyHint: '2,200 – 2,499 sq ft' },
  { tier: 6, label: '2,500 – 2,799 sq ft', minSqft: 2500, maxSqft: 2799, standardPrice: 250, deepPrice: 460, strOnSitePrice: 375, strOffSitePrice: 545, sqftEquivalent: '2,500 – 2,799 sq ft', propertyHint: '2,500 – 2,799 sq ft' },
  { tier: 7, label: '2,800 – 3,099 sq ft', minSqft: 2800, maxSqft: 3099, standardPrice: 270, deepPrice: 505, strOnSitePrice: 410, strOffSitePrice: 600, sqftEquivalent: '2,800 – 3,099 sq ft', propertyHint: '2,800 – 3,099 sq ft' },
  { tier: 8, label: '3,100 – 3,399 sq ft', minSqft: 3100, maxSqft: 3399, standardPrice: 295, deepPrice: 550, strOnSitePrice: 450, strOffSitePrice: 650, sqftEquivalent: '3,100 – 3,399 sq ft', propertyHint: '3,100 – 3,399 sq ft' },
  { tier: 9, label: '3,400 – 3,699 sq ft', minSqft: 3400, maxSqft: 3699, standardPrice: 315, deepPrice: 590, strOnSitePrice: 480, strOffSitePrice: 700, sqftEquivalent: '3,400 – 3,699 sq ft', propertyHint: '3,400 – 3,699 sq ft' },
  { tier: 10, label: '3,700 – 3,999 sq ft', minSqft: 3700, maxSqft: 3999, standardPrice: 335, deepPrice: 640, strOnSitePrice: 520, strOffSitePrice: 760, sqftEquivalent: '3,700 – 3,999 sq ft', propertyHint: '3,700 – 3,999 sq ft' },
  { tier: 11, label: '4,000 – 4,299 sq ft', minSqft: 4000, maxSqft: 4299, standardPrice: 355, deepPrice: 695, strOnSitePrice: 560, strOffSitePrice: 830, sqftEquivalent: '4,000 – 4,299 sq ft', propertyHint: '4,000 – 4,299 sq ft' },
  { tier: 12, label: '4,300 – 4,599 sq ft', minSqft: 4300, maxSqft: 4599, standardPrice: 385, deepPrice: 740, strOnSitePrice: 600, strOffSitePrice: 880, sqftEquivalent: '4,300 – 4,599 sq ft', propertyHint: '4,300 – 4,599 sq ft' },
  { tier: 13, label: '4,600 – 4,899 sq ft', minSqft: 4600, maxSqft: 4899, standardPrice: 410, deepPrice: 785, strOnSitePrice: 635, strOffSitePrice: 935, sqftEquivalent: '4,600 – 4,899 sq ft', propertyHint: '4,600 – 4,899 sq ft' },
  { tier: 14, label: '4,900 – 5,299 sq ft', minSqft: 4900, maxSqft: 5299, standardPrice: 435, deepPrice: 820, strOnSitePrice: 665, strOffSitePrice: 975, sqftEquivalent: '4,900 – 5,299 sq ft', propertyHint: '4,900 – 5,299 sq ft' },
  { tier: 15, label: '5,300 – 5,699 sq ft', minSqft: 5300, maxSqft: 5699, standardPrice: 455, deepPrice: 850, strOnSitePrice: 690, strOffSitePrice: 1010, sqftEquivalent: '5,300 – 5,699 sq ft', propertyHint: '5,300 – 5,699 sq ft' },
  { tier: 16, label: '5,700 – 6,099 sq ft', minSqft: 5700, maxSqft: 6099, standardPrice: 480, deepPrice: 890, strOnSitePrice: 725, strOffSitePrice: 1055, sqftEquivalent: '5,700 – 6,099 sq ft', propertyHint: '5,700 – 6,099 sq ft' },
  { tier: 17, label: '6,100+ sq ft', minSqft: 6100, maxSqft: 99999, standardPrice: 0, deepPrice: 0, strOnSitePrice: 0, strOffSitePrice: 0, sqftEquivalent: '6,100+ sq ft', propertyHint: '6,100+ sq ft', isCustomQuote: true },
];

export const getTierPrice = (tier: PricingTier, type: CleaningServiceTierType): number => {
  if (tier.isCustomQuote) return 0;
  switch (type) {
    case 'standard':
      return tier.standardPrice;
    case 'deep':
      return tier.deepPrice;
    case 'str_on_site':
      return tier.strOnSitePrice;
    case 'str_off_site':
      return tier.strOffSitePrice;
    default:
      return tier.standardPrice;
  }
};

export type ServiceFrequency = 'one_time' | 'weekly' | 'biweekly' | 'monthly';

export interface FrequencyOption {
  id: ServiceFrequency;
  nameKey: string;
  discountPercent: number;
  badge: string;
  isPopular?: boolean;
}

export const SERVICE_FREQUENCIES: FrequencyOption[] = [
  { id: 'biweekly', nameKey: 'schedule.frequency_biweekly', discountPercent: 15, badge: '15% OFF', isPopular: true },
  { id: 'weekly', nameKey: 'schedule.frequency_weekly', discountPercent: 20, badge: '20% OFF' },
  { id: 'monthly', nameKey: 'schedule.frequency_monthly', discountPercent: 10, badge: '10% OFF' },
  { id: 'one_time', nameKey: 'schedule.frequency_one_time', discountPercent: 0, badge: 'Full Price' },
];

export const getTierBySqft = (sqft: number): PricingTier => {
  if (sqft >= 6100) return PRICING_TIERS[PRICING_TIERS.length - 1];
  if (sqft < 500) return PRICING_TIERS[0];
  const match = PRICING_TIERS.find((t) => sqft >= t.minSqft && sqft <= t.maxSqft);
  return match || PRICING_TIERS[0]; // Defaults to Tier 0 (500 - 999 sq ft)
};
