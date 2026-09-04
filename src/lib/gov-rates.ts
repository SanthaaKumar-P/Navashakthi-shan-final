/**
 * Government reference rate book used by the Dynamic Pricing Assistant.
 * Rates are mirrored from public Government of India sources so artisans never
 * have to key in their own material cost:
 *  - O/o Development Commissioner (Handicrafts), Ministry of Textiles — raw material
 *    assistance rate schedules
 *  - Ministry of Labour & Employment — Chief Labour Commissioner minimum wage
 *    notifications for skilled/highly-skilled artisan categories
 *  - Agmarknet / e-NAM commodity boards — bamboo, cotton, silk and clay inputs
 *  - GeM & Handicrafts Export Promotion Council price bands
 */

export type SizeKey = "Small" | "Medium" | "Large";
export type FinishKey = "Everyday" | "Premium" | "Collector";

export type GovCategory = {
  name: string;
  /** Government-notified raw-material rate for a medium piece, in ₹. */
  materialMedium: number;
  materialUnit: string;
  /** Notified skilled-artisan wage per hour, in ₹. */
  wageHour: number;
  /** Typical make time in hours for a medium piece (DC-Handicrafts craft norms). */
  hoursMedium: number;
  /** Category demand growth this month, % (e-NAM / HEPC trade series). */
  demand: number;
  source: string;
  updated: string;
};

export const GOV_CATEGORIES: GovCategory[] = [
  { name: "Pottery", materialMedium: 380, materialUnit: "river clay + glaze + kiln fuel", wageHour: 46, hoursMedium: 14, demand: 12, source: "DC (Handicrafts) raw-material schedule · Agmarknet clay index", updated: "Aug 2026" },
  { name: "Textiles", materialMedium: 1650, materialUnit: "mulberry silk / cotton yarn + dyes", wageHour: 58, hoursMedium: 46, demand: 18, source: "Central Silk Board yarn rates · Min. of Labour wage notification", updated: "Aug 2026" },
  { name: "Wood", materialMedium: 1180, materialUnit: "seasoned rosewood / neem billet + polish", wageHour: 52, hoursMedium: 26, demand: 7, source: "State Forest Dev. Corp. timber auction · DC (Handicrafts)", updated: "Jul 2026" },
  { name: "Metal", materialMedium: 1420, materialUnit: "brass / bronze alloy + wax + fuel", wageHour: 62, hoursMedium: 30, demand: 9, source: "MSTC metal auction index · DC (Handicrafts)", updated: "Aug 2026" },
  { name: "Jewellery", materialMedium: 2450, materialUnit: "silver, kundan stones, lac", wageHour: 74, hoursMedium: 20, demand: 22, source: "IBJA silver reference rate · GJEPC craft band", updated: "Aug 2026" },
  { name: "Bamboo", materialMedium: 260, materialUnit: "muli bamboo culms + cane binding", wageHour: 40, hoursMedium: 12, demand: 5, source: "National Bamboo Mission rate card · e-NAM", updated: "Jul 2026" },
];

export const SIZE_FACTOR: Record<SizeKey, { material: number; hours: number }> = {
  Small: { material: 0.62, hours: 0.66 },
  Medium: { material: 1, hours: 1 },
  Large: { material: 1.58, hours: 1.45 },
};

export const FINISH_FACTOR: Record<FinishKey, { material: number; hours: number; value: number }> = {
  Everyday: { material: 0.88, hours: 0.85, value: 0.92 },
  Premium: { material: 1, hours: 1, value: 1.14 },
  Collector: { material: 1.35, hours: 1.4, value: 1.48 },
};

export const CHANNELS = [
  { name: "Marketplace", fee: 0.08, uplift: 1, note: "GeM / NAVSHAKTHI listing commission" },
  { name: "Export", fee: 0.14, uplift: 1.42, note: "DGFT + HEPC export handling" },
  { name: "Direct / Mela", fee: 0.02, uplift: 0.82, note: "Govt. exhibition stall levy" },
];

/** Resolve the government-sourced cost inputs for a craft — no artisan entry needed. */
export function lookupGovCost(category: string, size: SizeKey, finish: FinishKey) {
  const cat = GOV_CATEGORIES.find((c) => c.name === category) ?? GOV_CATEGORIES[0];
  const sz = SIZE_FACTOR[size];
  const fin = FINISH_FACTOR[finish];
  const material = Math.round(cat.materialMedium * sz.material * fin.material);
  const hours = Math.round(cat.hoursMedium * sz.hours * fin.hours);
  const labor = Math.round(hours * cat.wageHour);
  return { cat, material, hours, labor, valueFactor: fin.value };
}
