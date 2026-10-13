export interface STRTier {
  bedrooms: number;
  labelKey: string;
  maxSqftHint: number;
  includedBathrooms: number;
  basePrice: number;
  externalLaundryFee: number;
  isCustomQuote?: boolean;
}

/**
 * Short-Term Rental (Airbnb / Vrbo) Turnover Pricing Structure
 * Based on recommended Denver STR market analysis:
 * - Quotes are structured by bedrooms & bathrooms instead of sqft.
 * - Included bathrooms: Studio/1 Bed (1), 2 Beds (2), 3 Beds (2), 4 Beds (3), 5 Beds (4).
 * - Additional bathrooms over included: +$25 each.
 * - Properties with 6+ bedrooms or > 3,500 sq ft trigger Custom Quote.
 * - External Laundry (if no washer/dryer on-site): from $45 scaled by bedroom count.
 */
export const STR_TIERS: STRTier[] = [
  {
    bedrooms: 0, // Studio
    labelKey: 'schedule.studio',
    maxSqftHint: 800,
    includedBathrooms: 1,
    basePrice: 90,
    externalLaundryFee: 45,
  },
  {
    bedrooms: 1,
    labelKey: '1 Bed',
    maxSqftHint: 800,
    includedBathrooms: 1,
    basePrice: 90,
    externalLaundryFee: 45,
  },
  {
    bedrooms: 2,
    labelKey: '2 Beds',
    maxSqftHint: 1200,
    includedBathrooms: 2,
    basePrice: 135,
    externalLaundryFee: 70,
  },
  {
    bedrooms: 3,
    labelKey: '3 Beds',
    maxSqftHint: 1800,
    includedBathrooms: 2,
    basePrice: 185,
    externalLaundryFee: 95,
  },
  {
    bedrooms: 4,
    labelKey: '4 Beds',
    maxSqftHint: 2500,
    includedBathrooms: 3,
    basePrice: 255,
    externalLaundryFee: 120,
  },
  {
    bedrooms: 5,
    labelKey: '5 Beds',
    maxSqftHint: 3500,
    includedBathrooms: 4,
    basePrice: 330,
    externalLaundryFee: 145,
  },
  {
    bedrooms: 6,
    labelKey: '6+ Beds',
    maxSqftHint: 99999,
    includedBathrooms: 4,
    basePrice: 0,
    externalLaundryFee: 0,
    isCustomQuote: true,
  },
];

export const STR_EXTRA_BATHROOM_PRICE = 25;

export const getSTRTierByBedrooms = (bedrooms: number): STRTier => {
  if (bedrooms >= 6) return STR_TIERS[STR_TIERS.length - 1];
  const found = STR_TIERS.find((t) => t.bedrooms === bedrooms);
  return found || STR_TIERS[1]; // default 1 Bed
};

export const calculateSTRPrice = ({
  bedrooms,
  bathrooms,
  hasWasherDryer,
}: {
  bedrooms: number;
  bathrooms: number;
  hasWasherDryer: boolean;
}): {
  basePrice: number;
  extraBathrooms: number;
  extraBathroomFee: number;
  externalLaundryFee: number;
  totalBeforeAddons: number;
  isCustomQuote: boolean;
  includedBathrooms: number;
  maxSqftHint: number;
} => {
  const tier = getSTRTierByBedrooms(bedrooms);
  if (tier.isCustomQuote) {
    return {
      basePrice: 0,
      extraBathrooms: 0,
      extraBathroomFee: 0,
      externalLaundryFee: 0,
      totalBeforeAddons: 0,
      isCustomQuote: true,
      includedBathrooms: tier.includedBathrooms,
      maxSqftHint: tier.maxSqftHint,
    };
  }

  const extraBathrooms = Math.max(0, Math.floor(bathrooms - tier.includedBathrooms));
  const extraBathroomFee = extraBathrooms * STR_EXTRA_BATHROOM_PRICE;
  const externalLaundryFee = hasWasherDryer ? 0 : tier.externalLaundryFee;
  const totalBeforeAddons = tier.basePrice + extraBathroomFee + externalLaundryFee;

  return {
    basePrice: tier.basePrice,
    extraBathrooms,
    extraBathroomFee,
    externalLaundryFee,
    totalBeforeAddons,
    isCustomQuote: false,
    includedBathrooms: tier.includedBathrooms,
    maxSqftHint: tier.maxSqftHint,
  };
};
