import { CityData, CityId } from './types';

export const CITIES: Record<CityId, CityData> = {
  sf: {
    name: 'San Francisco',
    adultPopulation: 715000,
    obesityRate: 0.19,
    raceDist: {
      white: 0.39,
      asian: 0.37,
      hispanic: 0.15,
      black: 0.05,
      other: 0.04,
    },
    income: {
      p10: 11000,
      p50: 141446,
      p70: 215000,
      p75: 170000, // Top 25% (75th percentile)
      p90: 385000,
      p95: 550000,
    },
  },
  la: {
    name: 'Los Angeles',
    adultPopulation: 3000000,
    obesityRate: 0.28,
    raceDist: {
      white: 0.28,
      hispanic: 0.48,
      asian: 0.12,
      black: 0.08,
      other: 0.04,
    },
    income: {
      p10: 19700,
      p50: 87800,
      p70: 135000,
      p75: 115000, // Top 25% (75th percentile)
      p90: 242000,
      p95: 315000,
    },
  },
  nyc: {
    name: 'New York City',
    adultPopulation: 6500000,
    obesityRate: 0.24,
    raceDist: {
      white: 0.32,
      hispanic: 0.29,
      black: 0.20,
      asian: 0.14,
      other: 0.05,
    },
    income: {
      p10: 18500,
      p50: 81228,
      p70: 130000,
      p75: 135000, // Top 25% (75th percentile)
      p90: 255000,
      p95: 350000,
    },
  },
};

export const HEIGHT_DIST = {
  male: { mean: 70, sd: 3 },
  female: { mean: 64, sd: 3 },
};

export const LIFESTYLE_RATES = {
  male: {
    nonSmoker: 0.82, // 18% smokers
    wantsChildren: 0.55, // 45% reduction (55% remain)
  },
  female: {
    nonSmoker: 0.88, // 12% smokers
    wantsChildren: 0.45, // 55% reduction (45% remain)
  },
};
