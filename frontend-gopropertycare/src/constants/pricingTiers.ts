export interface PricingTier {
  tier: number;
  label: string;
  minSqft: number;
  maxSqft: number;
  standardPrice: number;
  deepPrice: number;
  sqftEquivalent: string;
  propertyHint: string;
  isCustomQuote?: boolean;
}

export const PRICING_TIERS: PricingTier[] = [
  { tier: 1, label: '500 – 999 sq ft', minSqft: 500, maxSqft: 999, standardPrice: 160, deepPrice: 215, sqftEquivalent: 'Studio / 1 Bed', propertyHint: 'Studio / 1 Bed' },
  { tier: 2, label: '1,000 – 1,299 sq ft', minSqft: 1000, maxSqft: 1299, standardPrice: 210, deepPrice: 275, sqftEquivalent: '1 – 2 Bed Home', propertyHint: '1 – 2 Bed Home' },
  { tier: 3, label: '1,300 – 1,599 sq ft', minSqft: 1300, maxSqft: 1599, standardPrice: 250, deepPrice: 325, sqftEquivalent: '2 – 3 Bed Home', propertyHint: '2 – 3 Bed Home' },
  { tier: 4, label: '1,600 – 1,899 sq ft', minSqft: 1600, maxSqft: 1899, standardPrice: 285, deepPrice: 370, sqftEquivalent: '3 Bed Home', propertyHint: '3 Bed Home' },
  { tier: 5, label: '1,900 – 2,199 sq ft', minSqft: 1900, maxSqft: 2199, standardPrice: 320, deepPrice: 415, sqftEquivalent: '3 – 4 Bed Home', propertyHint: '3 – 4 Bed Home' },
  { tier: 6, label: '2,200 – 2,499 sq ft', minSqft: 2200, maxSqft: 2499, standardPrice: 355, deepPrice: 460, sqftEquivalent: '4 Bed Home', propertyHint: '4 Bed Home' },
  { tier: 7, label: '2,500 – 2,799 sq ft', minSqft: 2500, maxSqft: 2799, standardPrice: 395, deepPrice: 510, sqftEquivalent: '4 – 5 Bed Home', propertyHint: '4 – 5 Bed Home' },
  { tier: 8, label: '2,800 – 3,099 sq ft', minSqft: 2800, maxSqft: 3099, standardPrice: 435, deepPrice: 565, sqftEquivalent: '5 Bed Large Home', propertyHint: '5 Bed Large Home' },
  { tier: 9, label: '3,100 – 3,399 sq ft', minSqft: 3100, maxSqft: 3399, standardPrice: 475, deepPrice: 615, sqftEquivalent: 'Spacious Residence', propertyHint: 'Spacious Residence' },
  { tier: 10, label: '3,400 – 3,699 sq ft', minSqft: 3400, maxSqft: 3699, standardPrice: 515, deepPrice: 670, sqftEquivalent: 'Spacious Residence', propertyHint: 'Spacious Residence' },
  { tier: 11, label: '3,700 – 3,999 sq ft', minSqft: 3700, maxSqft: 3999, standardPrice: 555, deepPrice: 720, sqftEquivalent: 'Executive Residence', propertyHint: 'Executive Residence' },
  { tier: 12, label: '4,000 – 4,299 sq ft', minSqft: 4000, maxSqft: 4299, standardPrice: 595, deepPrice: 775, sqftEquivalent: 'Executive Residence', propertyHint: 'Executive Residence' },
  { tier: 13, label: '4,300 – 4,599 sq ft', minSqft: 4300, maxSqft: 4599, standardPrice: 635, deepPrice: 825, sqftEquivalent: 'Luxury Home', propertyHint: 'Luxury Home' },
  { tier: 14, label: '4,600 – 4,899 sq ft', minSqft: 4600, maxSqft: 4899, standardPrice: 675, deepPrice: 875, sqftEquivalent: 'Luxury Home', propertyHint: 'Luxury Home' },
  { tier: 15, label: '4,900 – 5,199 sq ft', minSqft: 4900, maxSqft: 5199, standardPrice: 715, deepPrice: 930, sqftEquivalent: 'Grand Estate', propertyHint: 'Grand Estate' },
  { tier: 16, label: '5,200 – 5,499 sq ft', minSqft: 5200, maxSqft: 5499, standardPrice: 750, deepPrice: 975, sqftEquivalent: 'Grand Estate', propertyHint: 'Grand Estate' },
  { tier: 17, label: '5,500 – 5,799 sq ft', minSqft: 5500, maxSqft: 5799, standardPrice: 785, deepPrice: 1020, sqftEquivalent: 'Premier Estate', propertyHint: 'Premier Estate' },
  { tier: 18, label: '5,800 – 6,099 sq ft', minSqft: 5800, maxSqft: 6099, standardPrice: 820, deepPrice: 1065, sqftEquivalent: 'Premier Estate', propertyHint: 'Premier Estate' },
  { tier: 19, label: '6,100+ sq ft', minSqft: 6100, maxSqft: 99999, standardPrice: 0, deepPrice: 0, sqftEquivalent: 'Large Estate & Commercial', propertyHint: 'Large Estate & Commercial', isCustomQuote: true },
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
