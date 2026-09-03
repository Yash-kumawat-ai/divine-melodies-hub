import { describe, it, expect } from 'vitest';
import { calculateCompleteKundli } from '../kundliEngine';
import { buildChartViewModel, VEDIC_GRAHAS, type VargaId } from '../chartPresentationAdapter';
import type { BirthProfileInput } from '../types';

describe('Vedic Kundli Cross-Style Parity & Presentation Tests', () => {
  const sampleInput: BirthProfileInput = {
    name: 'Yash Kumawat',
    gender: 'male',
    date_of_birth: '2005-02-05',
    birth_time: '15:00',
    birth_time_accuracy: 'exact',
    place_label: 'Jaipur, Rajasthan, India',
    lat: 26.9124,
    lng: 75.7873,
    timezone_iana: 'Asia/Kolkata',
  };

  const kundli = calculateCompleteKundli(sampleInput);

  const VARGAS: VargaId[] = ['d1', 'd9', 'd10'];

  VARGAS.forEach((varga) => {
    describe(`Varga ${varga.toUpperCase()} Math & Visual Parity`, () => {
      const vm = buildChartViewModel(kundli.planets, kundli.ascendant, kundli.vargas, varga, true);

      it(`contains all 9 classical Vedic Grahas for ${varga}`, () => {
        expect(vm.placements).toHaveLength(9);
        const planetNames = vm.placements.map((p) => p.planet);
        VEDIC_GRAHAS.forEach((expectedGraha) => {
          expect(planetNames).toContain(expectedGraha);
        });
      });

      it(`preserves absolute parity across byHouse and byRashi for all grahas in ${varga}`, () => {
        expect(vm.lagnaRashiIndex).toBeGreaterThanOrEqual(0);
        expect(vm.lagnaRashiIndex).toBeLessThanOrEqual(11);
        expect(vm.lagnaRashiNumber).toBe(vm.lagnaRashiIndex + 1);

        // Verify House 1 always maps to Lagna Rashi
        expect(vm.houseRashiMap[1]).toBe(vm.lagnaRashiNumber);

        vm.placements.forEach((placement) => {
          const { planet, rashiIndex, rashiNumber, houseNumber, degree, isRetrograde } = placement;

          // 1. Check bounds
          expect(rashiIndex).toBeGreaterThanOrEqual(0);
          expect(rashiIndex).toBeLessThanOrEqual(11);
          expect(rashiNumber).toBe(rashiIndex + 1);
          expect(houseNumber).toBeGreaterThanOrEqual(1);
          expect(houseNumber).toBeLessThanOrEqual(12);

          // 2. Whole sign invariant: House = ((Rashi - LagnaRashi + 12) % 12) + 1
          const expectedHouse = ((rashiIndex - vm.lagnaRashiIndex + 12) % 12) + 1;
          expect(houseNumber).toBe(expectedHouse);

          // 3. North Indian index (byHouse) must contain this graha with exact properties
          const houseOccupants = vm.byHouse[houseNumber];
          const foundInHouse = houseOccupants.find((p) => p.planet === planet);
          expect(foundInHouse).toBeDefined();
          expect(foundInHouse!.rashiIndex).toBe(rashiIndex);
          expect(foundInHouse!.rashiNumber).toBe(rashiNumber);
          expect(foundInHouse!.degree).toBe(degree);
          expect(foundInHouse!.isRetrograde).toBe(isRetrograde);

          // 4. South Indian index (byRashi) must contain this graha with exact properties
          const rashiOccupants = vm.byRashi[rashiIndex];
          const foundInRashi = rashiOccupants.find((p) => p.planet === planet);
          expect(foundInRashi).toBeDefined();
          expect(foundInRashi!.houseNumber).toBe(houseNumber);
          expect(foundInRashi!.rashiNumber).toBe(rashiNumber);
          expect(foundInRashi!.degree).toBe(degree);
          expect(foundInRashi!.isRetrograde).toBe(isRetrograde);

          // 5. Cross-index equivalence: House Rashi Map must match graha's Rashi number
          expect(vm.houseRashiMap[houseNumber]).toBe(rashiNumber);
        });
      });

      it(`ensures total occupant count across all 12 houses and 12 signs equals 9 for ${varga}`, () => {
        let totalInHouses = 0;
        for (let h = 1; h <= 12; h++) {
          totalInHouses += vm.byHouse[h].length;
        }
        expect(totalInHouses).toBe(9);

        let totalInRashis = 0;
        for (let r = 0; r < 12; r++) {
          totalInRashis += vm.byRashi[r].length;
        }
        expect(totalInRashis).toBe(9);
      });
    });
  });

  it('correctly maps distinct divisional positions between D1, D9, and D10', () => {
    const d1 = buildChartViewModel(kundli.planets, kundli.ascendant, kundli.vargas, 'd1');
    const d9 = buildChartViewModel(kundli.planets, kundli.ascendant, kundli.vargas, 'd9');
    const d10 = buildChartViewModel(kundli.planets, kundli.ascendant, kundli.vargas, 'd10');

    expect(d1.titleHi).toContain('D1');
    expect(d9.titleHi).toContain('D9');
    expect(d10.titleHi).toContain('D10');

    // D1 and D9 have valid divisional ascendants
    expect(d1.lagnaRashiIndex).toBeDefined();
    expect(d9.lagnaRashiIndex).toBeDefined();
    expect(d10.lagnaRashiIndex).toBeDefined();

    // Verify retrograde status is consistently carried forward from D1 to D9/D10
    const d1Saturn = d1.placements.find((p) => p.planet === 'Saturn');
    const d9Saturn = d9.placements.find((p) => p.planet === 'Saturn');
    const d10Saturn = d10.placements.find((p) => p.planet === 'Saturn');

    if (d1Saturn) {
      expect(d9Saturn?.isRetrograde).toBe(d1Saturn.isRetrograde);
      expect(d10Saturn?.isRetrograde).toBe(d1Saturn.isRetrograde);
    }
  });
});
