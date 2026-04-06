import { HEIGHT_DIST, CITIES, LIFESTYLE_RATES } from '../constants';
import { Gender, CityId, Race } from '../types';

/**
 * Standard Normal CDF approximation
 */
function normalCDF(x: number, mean: number, sd: number): number {
  const z = (x - mean) / sd;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const d = 0.3989423 * Math.exp(-z * z / 2);
  const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));
  return z > 0 ? 1 - p : p;
}

/**
 * Log-normal probability: P(X >= x)
 * We estimate mu and sigma from p50 (median) and p90.
 */
/**
 * Single Rate: Estimated % of the population that is single/available.
 * Rates are higher in major cities (SF, NYC, LA) than national averages.
 */
function getSingleRate(age: number): number {
  if (age < 25) return 0.85; // 85% single/available
  if (age < 35) return 0.65; // 65% single/available
  if (age < 45) return 0.50; // 50% single/available
  if (age < 55) return 0.40; // 40% single/available
  return 0.35; // 35% single/available for 55+
}

/**
 * Age Density: Not uniform. Peaks in young professional years (25-45).
 * We use a simple weighting function to estimate the % of the adult population in a range.
 */
function getAgeDensity(min: number, max: number): number {
  const totalSpan = 80 - 18;
  // Simple weighting: 25-45 is 2x as dense as other ages
  let weight = 0;
  for (let a = min; a < max; a++) {
    if (a >= 25 && a <= 45) weight += 2;
    else weight += 1;
  }
  let totalWeight = 0;
  for (let a = 18; a < 80; a++) {
    if (a >= 25 && a <= 45) totalWeight += 2;
    else totalWeight += 1;
  }
  return weight / totalWeight;
}

/**
 * Log-normal probability: P(X >= x)
 * We estimate mu and sigma from p50 (median) and p90.
 * Refinement: Median income is adjusted by age (peaks at 45).
 */
export function getIncomeProbability(cityId: CityId, minIncome: number, avgAge: number): number {
  if (minIncome <= 0) return 1;
  const city = CITIES[cityId];
  
  // Age factor: 22 -> 0.5, 45 -> 1.1, 70 -> 0.9
  const ageFactor = Math.max(0.4, 1.1 - Math.abs(avgAge - 45) * 0.02);
  const adjustedMedian = city.income.p50 * ageFactor;
  
  const mu = Math.log(adjustedMedian);
  const sigma = (Math.log(city.income.p90 * ageFactor) - mu) / 1.28155;
  
  const pLess = normalCDF(Math.log(minIncome), mu, sigma);
  return 1 - pLess;
}

export function getHeightProbability(gender: Gender, minHeight: number): number {
  const dist = HEIGHT_DIST[gender];
  const pLess = normalCDF(minHeight, dist.mean, dist.sd);
  return 1 - pLess;
}

export function getRaceProbability(cityId: CityId, selectedRaces: Race[]): number {
  if (selectedRaces.length === 0) return 1;
  const city = CITIES[cityId];
  return selectedRaces.reduce((sum, race) => sum + city.raceDist[race], 0);
}

export function getLifestyleProbability(cityId: CityId, gender: Gender, toggles: { excludeObese: boolean; nonSmoker: boolean; wantsChildren: boolean }): number {
  let p = 1;
  if (toggles.excludeObese) p *= (1 - CITIES[cityId].obesityRate);
  
  const rates = LIFESTYLE_RATES[gender];
  if (toggles.nonSmoker) p *= rates.nonSmoker;
  if (toggles.wantsChildren) p *= rates.wantsChildren;
  return p;
}

/**
 * Healthy Age Range: Maturity-Stage Aware
 * Discourages predatory gaps by respecting life stages (e.g., 25 as a maturity threshold).
 * - Under 25: Very tight range (peers only).
 * - 25-30: Transitions to wider gaps but protects the 25+ threshold.
 * - 30+: Scales with age but maintains a 'mature' floor.
 */
export function getHealthyAgeRange(userAge: number): { min: number; max: number } {
  let min: number;
  let max: number;

  if (userAge < 25) {
    // Early adulthood: Stay within the immediate peer group
    min = Math.max(18, userAge - 2);
    max = userAge + 3;
  } else if (userAge <= 26) {
    // Transition ages 25-26: Allow slightly younger (minus 2)
    min = userAge - 2;
    max = userAge + 5;
  } else if (userAge < 35) {
    // Young professional: Floor is set to 25 to respect maturity stages
    min = Math.max(25, userAge - 5);
    max = userAge + 7;
  } else {
    // Mature adulthood: Scales more broadly
    min = Math.max(25, Math.floor(userAge * 0.8));
    max = Math.min(80, Math.ceil(userAge * 1.2));
  }

  return { min, max };
}

/**
 * Denominator logic:
 * Start with City adult population / 2 (gender split).
 * Baseline age range is contextual to the user's age.
 */
export function calculateMatches(filters: {
  city: CityId;
  userAge: number;
  userIncome: number;
  userNotObese: boolean;
  userNonSmoker: boolean;
  userWantsChildren: boolean;
  userSecureAttachment: boolean;
  gender: Gender;
  minAge: number;
  maxAge: number;
  minHeight: number;
  minIncome: number;
  selectedRaces: Race[];
  excludeObese: boolean;
  nonSmoker: boolean;
  wantsChildren: boolean;
  secureAttachment: boolean;
}) {
  const city = CITIES[filters.city];
  const totalAdults = city.adultPopulation;
  const genderPool = totalAdults / 2;
  
  const baseline = getHealthyAgeRange(filters.userAge);
  const baselineDensity = getAgeDensity(baseline.min, baseline.max);
  const baselineAvgAge = (baseline.min + baseline.max) / 2;
  const baselineSingleRate = getSingleRate(baselineAvgAge);
  const baselineDenominator = genderPool * baselineDensity * baselineSingleRate;
  
  const selectedDensity = getAgeDensity(filters.minAge, filters.maxAge);
  const avgAge = (filters.minAge + filters.maxAge) / 2;
  const selectedSingleRate = getSingleRate(avgAge);
  
  const selectedRange = filters.maxAge - filters.minAge;
  const baselineRange = baseline.max - baseline.min;
  
  // Denominator logic for the actual matches
  let actualDenominator: number;
  let ageFilterProbability: number;
  
  if (selectedRange > baselineRange) {
    actualDenominator = genderPool * selectedDensity * selectedSingleRate;
    ageFilterProbability = 1;
  } else {
    actualDenominator = baselineDenominator;
    ageFilterProbability = (selectedDensity * selectedSingleRate) / (baselineDensity * baselineSingleRate);
  }
  
  const pHeight = getHeightProbability(filters.gender, filters.minHeight);
  const pIncome = getIncomeProbability(filters.city, filters.minIncome, avgAge);
  const pRace = getRaceProbability(filters.city, filters.selectedRaces);
  const pLifestyle = getLifestyleProbability(filters.city, filters.gender, {
    excludeObese: filters.excludeObese,
    nonSmoker: filters.nonSmoker,
    wantsChildren: filters.wantsChildren
  });
  
  // The "Match Rate" is the probability within the selected pool (excluding the age filter itself)
  let matchRate = pHeight * pIncome * pRace * pLifestyle;

  // Assortative Mating Multiplier:
  // If user is top 75th percentile and meets their own income requirement, apply 1.3x bonus
  const userIsHighEarner = filters.userIncome >= city.income.p75;
  const userMeetsOwnIncomeRequirement = filters.userIncome >= filters.minIncome;

  // Global Affinity Multiplier (Phenotypic Assortative Mating):
  // If user selects 3 or more of their own lifestyle toggles, apply 1.6x multiplier.
  const userToggles = [
    filters.userNotObese,
    filters.userNonSmoker,
    filters.userWantsChildren,
    filters.userSecureAttachment
  ];
  const activeUserToggles = userToggles.filter(Boolean).length;

  // Correlation Factor (Clustering Multiplier):
  // Offsets the "Independence Trap" where we assume traits like high income and fitness are independent.
  // In reality, these traits cluster. If 3+ restrictive filters are active, apply 1.15x boost.
  const restrictiveFilters = [
    filters.minIncome > city.income.p50,
    filters.minHeight > HEIGHT_DIST[filters.gender].mean,
    filters.excludeObese,
    filters.nonSmoker,
    filters.wantsChildren,
    filters.secureAttachment
  ];
  const activeRestrictiveFilters = restrictiveFilters.filter(Boolean).length;

  // Apply multipliers to the match rate
  // Secure Attachment Type reduction (30% of pool is secure)
  if (filters.secureAttachment) {
    const secureMultiplier = filters.userSecureAttachment ? 0.5 : 0.3;
    matchRate *= secureMultiplier;
  }

  // Assortative Mating Multiplier
  if (userIsHighEarner && userMeetsOwnIncomeRequirement) {
    matchRate *= 1.3;
  }

  // Global Affinity Multiplier
  if (activeUserToggles >= 3) {
    matchRate *= 1.6;
  }

  // Correlation Factor
  if (activeRestrictiveFilters >= 3) {
    matchRate *= 1.15;
  }

  // Dating Up Penalty
  if (filters.minIncome > filters.userIncome * 2 && filters.minIncome > 0) {
    matchRate *= 0.75;
  }

  // Cap match rate at 1.0
  matchRate = Math.min(1.0, matchRate);

  // Remaining matches is the actual pool size multiplied by the match rate
  // If age range is narrower than baseline, we still use the actual density/single rate
  const selectedPool = genderPool * selectedDensity * selectedSingleRate;
  const remainingMatches = Math.max(0, Math.round(selectedPool * matchRate));
  
  // Fairness Probability is relative to the baseline pool
  const fairnessProbability = Math.min(1.0, remainingMatches / baselineDenominator);
  
  return {
    remainingMatches,
    denominatorPool: selectedPool,
    baselineDenominator,
    baselineRange: baseline,
    totalProbability: fairnessProbability,
    matchRate,
    breakdown: {
      age: ageFilterProbability,
      height: pHeight,
      income: pIncome,
      race: pRace,
      lifestyle: pLifestyle
    }
  };
}
