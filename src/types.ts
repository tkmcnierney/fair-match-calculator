export type CityId = 'sf' | 'la' | 'nyc';
export type Gender = 'male' | 'female';
export type Race = 'white' | 'black' | 'hispanic' | 'asian' | 'other';

export interface CityData {
  name: string;
  adultPopulation: number;
  obesityRate: number;
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
