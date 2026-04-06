import { useState, useMemo } from 'react';
import { Header } from './components/Header';
import { FilterSection } from './components/FilterSection';
import { MatchRateSlider, RollingCounter } from './components/Visualizer';
import { SummarySection } from './components/SummarySection';
import { UserFilters } from './types';
import { calculateMatches, getHealthyAgeRange } from './utils/math';

const DEFAULT_USER_AGE = 30;
const INITIAL_AGE_RANGE = getHealthyAgeRange(DEFAULT_USER_AGE);

const INITIAL_FILTERS: UserFilters = {
  city: 'sf',
  userAge: DEFAULT_USER_AGE,
  userIncome: 100000,
  userNotObese: false,
  userNonSmoker: false,
  userWantsChildren: false,
  userSecureAttachment: false,
  gender: 'female',
  minAge: INITIAL_AGE_RANGE.min,
  maxAge: INITIAL_AGE_RANGE.max,
  minHeight: 60, // 5'0"
  minIncome: 50000,
  selectedRaces: [],
  excludeObese: false,
  nonSmoker: false,
  wantsChildren: false,
  secureAttachment: false,
};

export default function App() {
  const [filters, setFilters] = useState<UserFilters>(INITIAL_FILTERS);

  const results = useMemo(() => calculateMatches(filters), [filters]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto px-4 pb-24">
        <Header baselineRange={results.baselineRange} />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Inputs */}
          <div className="lg:col-span-5 order-2 lg:order-1">
            <FilterSection filters={filters} onChange={setFilters} />
          </div>

          {/* Right Column: Visualization & Results */}
          <div className="lg:col-span-7 order-1 lg:order-2 lg:sticky lg:top-8 space-y-12">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="text-[12px] uppercase tracking-[0.2em] text-white/40 font-mono">
                Match Rate
              </div>
              <div className="text-7xl md:text-8xl font-bold tracking-tighter text-white tabular-nums">
                <RollingCounter value={results.matchRate * 100} decimals={2} suffix="%" />
              </div>
              
              <MatchRateSlider probability={results.matchRate} />
            </div>

            <SummarySection 
              probability={results.totalProbability}
              remainingMatches={results.remainingMatches}
              actualDenominator={results.denominatorPool}
              baselineDenominator={results.baselineDenominator}
            />
          </div>
        </div>
      </div>

      {/* Background Accents */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-blue-600/5 blur-[120px] rounded-full" />
      </div>
    </div>
  );
}
