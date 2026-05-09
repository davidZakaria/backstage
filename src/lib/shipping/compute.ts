import type { ShippingRateRule, ShippingZone } from "@prisma/client";

export function pickShippingRuleCents(
  zone: ShippingZone & { rateRules: ShippingRateRule[] },
  _cartWeightKg: number = 0,
): number {
  const rules = [...zone.rateRules].sort((a, b) => a.sortOrder - b.sortOrder);
  const match =
    rules.find((r) => {
      if (r.minWeightKg != null && _cartWeightKg < r.minWeightKg) return false;
      if (r.maxWeightKg != null && _cartWeightKg > r.maxWeightKg) return false;
      return true;
    }) ?? rules[0];
  return match?.feeCents ?? 0;
}
