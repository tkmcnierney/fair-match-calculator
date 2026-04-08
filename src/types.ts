export type CityId = 'nyc' | 'la' | 'chicago' | 'houston' | 'sd' | 'austin' | 'sf' | 'seattle' | 'denver' | 'dc' | 'boston' | 'atlanta' | 'london' | 'toronto' | 'sydney' | 'vancouver';
export type Gender = 'male' | 'female';
export type Race = 'white' | 'black' | 'hispanic' | 'asian' | 'other';
export type Sexuality = 'straight' | 'bisexual' | 'gay';

export interface CityData {
  name: string;
  adultPopulation: number;
  obesityRate: number;
  smokingRate: number;
  childrenRate: number; // % of population that wants children
  lgbtqRate: number; // % of population identifying as LGBTQ+
  heightOffset: number; // inches relative to global baseline
  incomeMax: number; // Max value for the income slider in local currency
  singleRateMultiplier: number; // Adjusts the global single rate for city culture
  currency: {
    symbol: string;
    code: string;
  };
  raceDist: Record<Race, number>;
  femaleRatio: number; // % of population that is female (e.g., 0.52)
  income: {
    p10: number;
    p50: number;
    p70: number;
    p75: number;
    p90: number;
    p95: number;
  };
}

export interface UserFilters {
  city: CityId;
  userAge: number;
  userIncome: number;
  userNotObese: boolean;
  userNonSmoker: boolean;
  userWantsChildren: boolean;
  userSecureAttachment: boolean;
  userRace?: Race;
  gender: Gender;
  minAge: number;
  maxAge: number;
  minHeight: number; // in inches
  minIncome: number;
  selectedRaces: Race[];
  selectedSexualities: Sexuality[];
  excludeObese: boolean;
  nonSmoker: boolean;
  wantsChildren: boolean;
  secureAttachment: boolean;
}
