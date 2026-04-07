export type CityId = 'nyc' | 'la' | 'chicago' | 'houston' | 'sd' | 'austin' | 'sf' | 'seattle' | 'denver' | 'dc' | 'boston' | 'atlanta' | 'london' | 'toronto' | 'sydney' | 'vancouver';
export type Gender = 'male' | 'female';
export type Race = 'white' | 'black' | 'hispanic' | 'asian' | 'other';

export interface CityData {
  name: string;
  adultPopulation: number;
  obesityRate: number;
  smokingRate: number;
  childrenRate: number; // % of population that wants children
  heightOffset: number; // inches relative to global baseline
  incomeMax: number; // Max value for the income slider in local currency
  singleRateMultiplier: number; // Adjusts the global single rate for city culture
  currency: {
    symbol: string;
    code: string;
  };
  raceDist: Record<Race, number>;
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
  excludeObese: boolean;
  nonSmoker: boolean;
  wantsChildren: boolean;
  secureAttachment: boolean;
}
