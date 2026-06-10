import { describe, expect, it } from "vitest";

import {
  bonusRemainder,
  calcBonusesAvailable,
} from "../../app/composables/useBonusCalc";

describe("bonus calculation", () => {
  it("counts available bonuses from paid omzet and already granted bonuses", () => {
    expect(calcBonusesAvailable(25000000, 10000000, 0)).toBe(2);
    expect(calcBonusesAvailable(25000000, 10000000, 2)).toBe(0);
  });

  it("matches the SRS worked example for two granted bonuses and remainder carry-over", () => {
    const accumulatedLunasOmzet = 25000000;
    const threshold = 10000000;
    const grantedBefore = 0;
    const available = calcBonusesAvailable(
      accumulatedLunasOmzet,
      threshold,
      grantedBefore,
    );

    expect(available).toBe(2);
    expect(
      bonusRemainder(
        accumulatedLunasOmzet,
        threshold,
        grantedBefore + available,
      ),
    ).toBe(5000000);
  });

  it("keeps the remaining accumulator after granted bonuses", () => {
    expect(bonusRemainder(25000000, 10000000, 2)).toBe(5000000);
  });

  it("disables bonus logic when the customer has no threshold", () => {
    expect(calcBonusesAvailable(25000000, 0, 0)).toBe(0);
    expect(bonusRemainder(25000000, 0, 0)).toBe(0);
  });
});
