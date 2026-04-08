import { HEIGHT_DIST, CITIES, LIFESTYLE_RATES } from '../constants';
import { Gender, CityId, Race, Sexuality } from '../types';

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

export function getHeightProbability(cityId: CityId, gender: Gender, minHeight: number): number {
  const dist = HEIGHT_DIST[gender];
  const city = CITIES[cityId];
  const adjustedMean = dist.mean + city.heightOffset;
  const pLess = normalCDF(minHeight, adjustedMean, dist.sd);
  return 1 - pLess;
}

export function getRaceProbability(cityId: CityId, selectedRaces: Race[], userRace?: Race): number {
  if (selectedRaces.length === 0) return 1;
  const city = CITIES[cityId];
  
  const totalProb = selectedRaces.reduce((sum, race) => {
    let prob = city.raceDist[race];
    // Apply a subtle "Social Density" nudge (1.15x) if the user is looking for their own race.
    // This reflects higher mutual affinity and shared social circles without a massive "jump".
    if (race === userRace) {
      prob *= 1.15;
    }
    return sum + prob;
  }, 0);

  return Math.min(1.0, totalProb);
}

export function getSexualityProbability(cityId: CityId, gender: Gender, selectedSexualities: Sexuality[]): number {
  if (selectedSexualities.length === 0) return 1;
  const city = CITIES[cityId];
  const lgbtqRate = city.lgbtqRate;
  const straightRate = 1 - lgbtqRate;

  // Distribution within LGBTQ+ pool (estimated)
  // Bisexual: 57%
  // Gay/Lesbian: 32% (18% Gay men, 14% Lesbian women)
  const bisexualRate = lgbtqRate * 0.57;
  const gayRate = gender === 'male' ? lgbtqRate * 0.18 : lgbtqRate * 0.14;

  let totalProb = 0;
  if (selectedSexualities.includes('straight')) totalProb += straightRate;
  if (selectedSexualities.includes('bisexual')) totalProb += bisexualRate;
  if (selectedSexualities.includes('gay')) totalProb += gayRate;

  return Math.min(1.0, totalProb);
}

export function getLifestyleProbability(cityId: CityId, gender: Gender, toggles: { excludeObese: boolean; nonSmoker: boolean; wantsChildren: boolean }): number {
  let p = 1;
  const city = CITIES[cityId];
  if (toggles.excludeObese) p *= (1 - city.obesityRate);
  
  const rates = LIFESTYLE_RATES[gender];
  if (toggles.nonSmoker) {
    // Use city-specific smoking rate, adjusted by gender-specific ratios
    const avgNonSmoker = (LIFESTYLE_RATES.male.nonSmoker + LIFESTYLE_RATES.female.nonSmoker) / 2;
    const genderRatio = rates.nonSmoker / avgNonSmoker;
    const cityNonSmokerRate = Math.min(1.0, (1 - city.smokingRate) * genderRatio);
    p *= cityNonSmokerRate;
  }
  if (toggles.wantsChildren) {
    // Use city-specific children rate, adjusted by gender-specific ratios
    const avgWantsChildren = (LIFESTYLE_RATES.male.wantsChildren + LIFESTYLE_RATES.female.wantsChildren) / 2;
    const genderRatio = rates.wantsChildren / avgWantsChildren;
    const cityWantsChildrenRate = Math.min(1.0, city.childrenRate * genderRatio);
    p *= cityWantsChildrenRate;
  }
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
  userRace: Race;
  gender: Gender;
  minAge: number;
  maxAge: number;
  minHeight: number;
  minIncome: number;
  selectedRaces: Race[];
  selectedSexualities: Sexuality[];
  excludeObese: boolean;
  nonSmoker: boolean;
  wantsChildren: boolean;
  secureAttachment: boolean;
}) {
  const city = CITIES[filters.city];
  const totalAdults = city.adultPopulation;
  const genderPool = filters.gender === 'female' 
    ? totalAdults * city.femaleRatio 
    : totalAdults * (1 - city.femaleRatio);
  
  const baselineRange = getHealthyAgeRange(filters.userAge);
  const baselineDensity = getAgeDensity(baselineRange.min, baselineRange.max);
  const baselineAvgAge = (baselineRange.min + baselineRange.max) / 2;
  const baselineSingleRate = getSingleRate(baselineAvgAge) * city.singleRateMultiplier;
  
  const pSexuality = getSexualityProbability(filters.city, filters.gender, filters.selectedSexualities);
  const baselineDenominator = genderPool * baselineDensity * baselineSingleRate * pSexuality;
  const baselinePool = genderPool * baselineDensity * baselineSingleRate;
  
  const selectedDensity = getAgeDensity(filters.minAge, filters.maxAge);
  const avgAge = (filters.minAge + filters.maxAge) / 2;
  const selectedSingleRate = getSingleRate(avgAge) * city.singleRateMultiplier;
  const selectedPool = genderPool * selectedDensity * selectedSingleRate;
  
  const selectedRange = filters.maxAge - filters.minAge;
  const baselineRangeSize = baselineRange.max - baselineRange.min;
  
  // Denominator logic for the actual matches
  let actualDenominator: number;
  let ageFilterProbability: number;
  
  if (selectedRange > baselineRangeSize) {
    actualDenominator = selectedPool;
    ageFilterProbability = 1;
  } else {
    actualDenominator = baselinePool;
    ageFilterProbability = selectedPool / baselinePool;
  }
  
  let pHeight = getHeightProbability(filters.city, filters.gender, filters.minHeight);
  
  let pIncome = getIncomeProbability(filters.city, filters.minIncome, avgAge);
  // Local Nudge: Income Reciprocity
  const userIsHighEarner = filters.userIncome >= city.income.p75;
  if (userIsHighEarner && filters.minIncome >= city.income.p50) {
    pIncome = Math.min(1.0, pIncome * 1.2);
  }

  const pRace = getRaceProbability(filters.city, filters.selectedRaces, filters.userRace);
  
  let pLifestyle = getLifestyleProbability(filters.city, filters.gender, {
    excludeObese: filters.excludeObese,
    nonSmoker: filters.nonSmoker,
    wantsChildren: filters.wantsChildren
  });

  // Local Nudge: Lifestyle Reciprocity
  const userToggles = [
    filters.userNotObese,
    filters.userNonSmoker,
    filters.userWantsChildren,
    filters.userSecureAttachment
  ];
  const activeUserToggles = userToggles.filter(Boolean).length;
  
  const seekingToggles = [
    filters.excludeObese,
    filters.nonSmoker,
    filters.wantsChildren,
    filters.secureAttachment
  ];
  const activeSeekingToggles = seekingToggles.filter(Boolean).length;

  if (activeUserToggles >= 3 && activeSeekingToggles >= 2) {
    pLifestyle = Math.min(1.0, pLifestyle * 1.3);
  } else if (activeUserToggles >= 3) {
    pLifestyle = Math.min(1.0, pLifestyle * 1.15);
  }
  
  // The "Match Rate" is the product of these locally-nudged probabilities
  let matchRate = pHeight * pIncome * pRace * pLifestyle * pSexuality * ageFilterProbability;

  // 1. Correlation Factor (Clustering Correction)
  // A global multiplier to account for the fact that desirable traits are not independent.
  const restrictiveFilters = [
    filters.minIncome > city.income.p50,
    filters.minHeight > HEIGHT_DIST[filters.gender].mean,
    filters.excludeObese,
    filters.nonSmoker,
    filters.wantsChildren,
    filters.secureAttachment
  ];
  const activeRestrictiveFilters = restrictiveFilters.filter(Boolean).length;
  if (activeRestrictiveFilters >= 3) {
    matchRate *= 1.15; 
  }

  // 2. Secure Attachment Filter (Pool Reduction)
  if (filters.secureAttachment) {
    const secureMultiplier = filters.userSecureAttachment ? 0.6 : 0.3;
    matchRate *= secureMultiplier;
  }

  // 3. Dating Up Penalty
  if (filters.minIncome > filters.userIncome * 2 && filters.minIncome > 0) {
    matchRate *= 0.7;
  }

  // Final Cap at 1.0
  matchRate = Math.min(1.0, matchRate);

  // Remaining matches is the actual pool size multiplied by the match rate
  // If age range is narrower than baseline, we still use the actual density/single rate
  const remainingMatches = Math.max(0, Math.round(selectedPool * matchRate));
  
  // Fairness Probability is relative to the baseline pool
  const fairnessProbability = Math.min(1.0, baselineDenominator > 0 ? remainingMatches / baselineDenominator : 0);
  
  // Bottleneck detection
  const probabilities = [
    { name: 'Age Range', value: ageFilterProbability },
    { name: 'Height', value: pHeight },
    { name: 'Income', value: pIncome },
    { name: 'Race/Ethnicity', value: pRace },
    { name: 'Sexuality', value: pSexuality },
    { name: 'Lifestyle/Health', value: pLifestyle },
  ];
  
  if (filters.secureAttachment) {
    probabilities.push({ name: 'Secure Attachment', value: filters.userSecureAttachment ? 0.6 : 0.3 });
  }

  const bottleneck = probabilities.sort((a, b) => a.value - b.value)[0];

  return {
    remainingMatches,
    denominatorPool: actualDenominator,
    baselineDenominator,
    baselineRange: baselineRange,
    totalProbability: fairnessProbability,
    matchRate,
    bottleneck: matchRate < 0.05 ? bottleneck.name : null,
    breakdown: {
      age: ageFilterProbability,
      height: pHeight,
      income: pIncome,
      race: pRace,
      lifestyle: pLifestyle
    }
  };
}
