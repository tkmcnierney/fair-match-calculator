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
  userRace: undefined,
  gender: 'female',
  minAge: INITIAL_AGE_RANGE.min,
  maxAge: INITIAL_AGE_RANGE.max,
  minHeight: 60, // 5'0"
  minIncome: 50000,
  selectedRaces: [],
  selectedSexualities: ['straight'],
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
              <div className="text-[12px] uppercase tracking-[0.2em] text-blue-500 font-mono font-bold">
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
              bottleneck={results.bottleneck}
              gender={filters.gender}
            />
          </div>
        </div>

        {/* Footer: Disclaimer & Methodology */}
        <footer className="mt-24 pt-12 border-t border-white/5 text-center space-y-6">
          <div className="max-w-2xl mx-auto space-y-4">
            <p className="text-[10px] uppercase tracking-widest text-white/20 font-mono">Methodology</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Estimates are derived from aggregate statistical models using 2024-2025 demographic trends from the US Census Bureau, CDC, ONS (UK), and World Bank. 
              Match rates are calculated using normal and log-normal distributions for height and income, with city-specific offsets for lifestyle and social density.
            </p>
            <div className="pt-4">
              <p className="text-[10px] text-white/20 italic">
                Disclaimer: For educational and entertainment purposes only. This tool provides statistical estimates and does not guarantee individual results or account for personal compatibility.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Mobile Sticky Match Rate Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 bg-zinc-900/90 backdrop-blur-xl border-t border-white/10 z-50 flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-[8px] uppercase tracking-widest text-blue-500 font-bold">Match Rate</span>
          <span className="text-2xl font-bold text-white tabular-nums">
            <RollingCounter value={results.matchRate * 100} decimals={2} suffix="%" />
          </span>
        </div>
        <div className="text-right">
          <span className="text-[8px] uppercase tracking-widest text-white/40 font-mono">Matches</span>
          <div className="text-lg font-medium text-white">{results.remainingMatches.toLocaleString()}</div>
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
