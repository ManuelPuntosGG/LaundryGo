export interface CheckboxAddon {
  id: string;
  name: string;
  price: number;
  i18nKey: string;
  descriptionKey: string;
}

export interface BeddingAddon {
  id: string;
  name: string;
  price: number;
  i18nKey: string;
}

export const CHECKBOX_ADDONS: CheckboxAddon[] = [
  {
    id: 'scent_beads',
    name: 'Downy Scent Beads',
    price: 3.50,
    i18nKey: 'addons.scentBeads.name',
    descriptionKey: 'addons.scentBeads.description',
  },
  {
    id: 'stain_treatment',
    name: 'Stain Treatment',
    price: 3.50,
    i18nKey: 'addons.stainTreatment.name',
    descriptionKey: 'addons.stainTreatment.description',
  },
];

export const BEDDING_ADDONS: BeddingAddon[] = [
  {
    id: 'comforter_twin_full',
    name: 'Comforter (Twin - Full)',
    price: 24.99,
    i18nKey: 'addons.bedding.comforterTwinFull',
  },
  {
    id: 'comforter_queen_king',
    name: 'Comforter (Queen - King)',
    price: 29.99,
    i18nKey: 'addons.bedding.comforterQueenKing',
  },
  {
    id: 'pillow',
    name: 'Pillow',
    price: 6.99,
    i18nKey: 'addons.bedding.pillow',
  },
  {
    id: 'mattress_cover_twin_full',
    name: 'Mattress Cover (Twin - Full)',
    price: 11.99,
    i18nKey: 'addons.bedding.mattressCoverTwinFull',
  },
  {
    id: 'mattress_cover_queen_king',
    name: 'Mattress Cover (Queen - King)',
    price: 14.99,
    i18nKey: 'addons.bedding.mattressCoverQueenKing',
  },
];

export const COMPANY_CONFIG = {
  phone: '(720) 590-8632',
  phoneRaw: '7205908632',
  email: 'info@thelaundrygo.com',
  minimumOrder: 40.00,
  recurringDiscountPercent: 7.5,
};

export function calculateAddonsTotal(
  selectedCheckboxes: Record<string, boolean>,
  counterQuantities: Record<string, number>
): number {
  let total = 0;

  for (const addon of CHECKBOX_ADDONS) {
    if (selectedCheckboxes[addon.id]) {
      total += addon.price;
    }
  }

  for (const item of BEDDING_ADDONS) {
    const qty = counterQuantities[item.id] || 0;
    if (qty > 0) {
      total += item.price * qty;
    }
  }

  return Math.round(total * 100) / 100;
}

export function formatAddonsSummary(
  selectedCheckboxes: Record<string, boolean>,
  counterQuantities: Record<string, number>,
  customNotes: string
): string {
  const lines: string[] = [];

  if (customNotes.trim()) {
    lines.push(`Notes: ${customNotes.trim()}`);
  }

  const activeCheckboxes = CHECKBOX_ADDONS.filter((a) => selectedCheckboxes[a.id]);
  if (activeCheckboxes.length > 0) {
    const names = activeCheckboxes.map((a) => `${a.name} (+$${a.price.toFixed(2)})`).join(', ');
    lines.push(`Add-ons: ${names}`);
  }

  const activeBedding = BEDDING_ADDONS.filter((b) => (counterQuantities[b.id] || 0) > 0);
  if (activeBedding.length > 0) {
    const items = activeBedding
      .map((b) => `${counterQuantities[b.id]}x ${b.name} ($${(b.price * counterQuantities[b.id]).toFixed(2)})`)
      .join(', ');
    lines.push(`Bedding: ${items}`);
  }

  const total = calculateAddonsTotal(selectedCheckboxes, counterQuantities);
  if (total > 0) {
    lines.push(`Add-ons Subtotal: $${total.toFixed(2)}`);
  }

  return lines.join('\n');
}
