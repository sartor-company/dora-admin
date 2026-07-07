export interface SkuBand {
  name: string;
  rate: number | null;
  band: 1 | 2 | 3 | 4;
}

export const SKU_BAND_ROWS = [
  { band: 1 as const, range: '1–5 SKUs', rate: 350_000 },
  { band: 2 as const, range: '6–20 SKUs', rate: 250_000 },
  { band: 3 as const, range: '21–50 SKUs', rate: 175_000 },
  { band: 4 as const, range: '51+ SKUs', rate: null },
];

export function skuBand(count: number): SkuBand {
  if (count >= 1 && count <= 5) return { name: '1–5 SKUs', rate: 350_000, band: 1 };
  if (count >= 6 && count <= 20) return { name: '6–20 SKUs', rate: 250_000, band: 2 };
  if (count >= 21 && count <= 50) return { name: '21–50 SKUs', rate: 175_000, band: 3 };
  return { name: '51+ SKUs', rate: null, band: 4 };
}

export function calcSkuAddCost(current: number, add: number, renewalMonthsRemaining = 7) {
  const total = current + add;
  const curBand = skuBand(current);
  const newBand = skuBand(total);
  if (newBand.rate === null) {
    return { total, newBand, curBand, prorata: 0, annual: 0, rerate: false };
  }
  const monthsFraction = renewalMonthsRemaining / 12;
  const prorata = Math.round(add * newBand.rate * monthsFraction);
  const annual = total * newBand.rate;
  const rerate = newBand.rate < (curBand.rate ?? Infinity);
  return { total, newBand, curBand, prorata, annual, rerate };
}
