export interface PricingTier {
  tier: number;
  label: string;
  minSqft: number;
  maxSqft: number;
  standardPrice: number;
  deepPrice: number;
  sqftEquivalent: string;
  isCustomQuote?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  { tier: 1, label: '500 – 999 sq ft', minSqft: 500, maxSqft: 999, standardPrice: 160, deepPrice: 215, sqftEquivalent: '$0.200 – $0.260' },
  { tier: 2, label: '1,000 – 1,299 sq ft', minSqft: 1000, maxSqft: 1299, standardPrice: 210, deepPrice: 275, sqftEquivalent: '$0.180 – $0.210' },
  { tier: 3, label: '1,300 – 1,599 sq ft', minSqft: 1300, maxSqft: 1599, standardPrice: 250, deepPrice: 325, sqftEquivalent: '$0.160 – $0.190' },
  { tier: 4, label: '1,600 – 1,899 sq ft', minSqft: 1600, maxSqft: 1899, standardPrice: 285, deepPrice: 370, sqftEquivalent: '$0.153 – $0.182' },
  { tier: 5, label: '1,900 – 2,199 sq ft', minSqft: 1900, maxSqft: 2199, standardPrice: 320, deepPrice: 415, sqftEquivalent: '$0.147 – $0.170' },
  { tier: 6, label: '2,200 – 2,499 sq ft', minSqft: 2200, maxSqft: 2499, standardPrice: 355, deepPrice: 460, sqftEquivalent: '$0.148 – $0.169' },
  { tier: 7, label: '2,500 – 2,799 sq ft', minSqft: 2500, maxSqft: 2799, standardPrice: 395, deepPrice: 510, sqftEquivalent: '$0.149 – $0.167' },
  { tier: 8, label: '2,800 – 3,099 sq ft', minSqft: 2800, maxSqft: 3099, standardPrice: 435, deepPrice: 565, sqftEquivalent: '$0.147 – $0.163' },
  { tier: 9, label: '3,100 – 3,399 sq ft', minSqft: 3100, maxSqft: 3399, standardPrice: 475, deepPrice: 615, sqftEquivalent: '$0.145 – $0.158' },
  { tier: 10, label: '3,400 – 3,699 sq ft', minSqft: 3400, maxSqft: 3699, standardPrice: 515, deepPrice: 670, sqftEquivalent: '$0.143 – $0.155' },
  { tier: 11, label: '3,700 – 3,999 sq ft', minSqft: 3700, maxSqft: 3999, standardPrice: 555, deepPrice: 720, sqftEquivalent: '$0.141 – $0.152' },
  { tier: 12, label: '4,000 – 4,299 sq ft', minSqft: 4000, maxSqft: 4299, standardPrice: 595, deepPrice: 775, sqftEquivalent: '$0.140 – $0.150' },
  { tier: 13, label: '4,300 – 4,599 sq ft', minSqft: 4300, maxSqft: 4599, standardPrice: 635, deepPrice: 825, sqftEquivalent: '$0.139 – $0.149' },
  { tier: 14, label: '4,600 – 4,899 sq ft', minSqft: 4600, maxSqft: 4899, standardPrice: 675, deepPrice: 875, sqftEquivalent: '$0.138 – $0.148' },
  { tier: 15, label: '4,900 – 5,199 sq ft', minSqft: 4900, maxSqft: 5199, standardPrice: 715, deepPrice: 930, sqftEquivalent: '$0.137 – $0.147' },
  { tier: 16, label: '5,200 – 5,499 sq ft', minSqft: 5200, maxSqft: 5499, standardPrice: 750, deepPrice: 975, sqftEquivalent: '$0.136 – $0.146' },
  { tier: 17, label: '5,500 – 5,799 sq ft', minSqft: 5500, maxSqft: 5799, standardPrice: 785, deepPrice: 1020, sqftEquivalent: '$0.135 – $0.144' },
  { tier: 18, label: '5,800 – 6,099 sq ft', minSqft: 5800, maxSqft: 6099, standardPrice: 820, deepPrice: 1065, sqftEquivalent: '$0.134 – $0.142' },
  { tier: 19, label: '6,100+ sq ft', minSqft: 6100, maxSqft: 99999, standardPrice: 0, deepPrice: 0, sqftEquivalent: 'Custom Quote', isCustomQuote: true },
];

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
  if (sqft >= 6100) return PRICING_TIERS[18];
  if (sqft < 500) return PRICING_TIERS[0];
  const match = PRICING_TIERS.find((t) => sqft >= t.minSqft && sqft <= t.maxSqft);
  return match || PRICING_TIERS[0]; // Defaults to Tier 1 (500 - 999 sq ft, Denver Min.)
};
