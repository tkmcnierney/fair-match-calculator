import { CityId, Gender, Race, Sexuality, UserFilters } from '../types';
import { CITIES } from '../constants';
import { getHealthyAgeRange } from '../utils/math';

import { Info } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Props {
  filters: UserFilters;
  onChange: (filters: UserFilters) => void;
}

export function FilterSection({ filters, onChange }: Props) {
  const [showAttachmentTooltip, setShowAttachmentTooltip] = useState(false);
  const [showUserAttachmentTooltip, setShowUserAttachmentTooltip] = useState(false);

  const update = (key: keyof UserFilters, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const city = CITIES[filters.city];

  const formatHeight = (inches: number) => {
    const ft = Math.floor(inches / 12);
    const in_ = inches % 12;
    return `${ft}'${in_}"`;
  };

  const formatIncome = (val: number) => {
    const symbol = city.currency.symbol;
    const code = city.currency.code;
    if (val >= 1000000) return `${symbol}${(val / 1000000).toFixed(1)}M+ (${code})`;
    if (val >= 1000) return `${symbol}${(val / 1000).toFixed(0)}k+ (${code})`;
    return `${symbol}${val} (${code})`;
  };

  const sortedCities = Object.entries(CITIES).sort((a, b) => b[1].adultPopulation - a[1].adultPopulation);

  return (
    <div className="space-y-12">
      {/* Your Info Section */}
      <div className="space-y-8 p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-mono font-bold">Your Information</h3>
          <p className="text-xs text-white/40 leading-relaxed">
            Your personal details apply <b>Local Nudges</b> to the specific pools you are searching in. For example, being a high-earner increases your Match Rate within the local high-earner pool, rewarding you for meeting your own standards without inflating the global index.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">City</label>
            <select 
              value={filters.city}
              onChange={(e) => update('city', e.target.value as CityId)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              {sortedCities.map(([id, data]) => (
                <option key={id} value={id}>{data.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Interested In</label>
            <select 
              value={filters.gender}
              onChange={(e) => update('gender', e.target.value as Gender)}
              className="w-full bg-zinc-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
            >
              <option value="female">Women</option>
              <option value="male">Men</option>
            </select>
          </div>
        </div>

        {/* User Race */}
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Your Race / Ethnicity</label>
            <p className="text-[10px] text-white/20 leading-tight">
              Used only to calculate cultural affinity nudges. You can keep it 'Not Specified'.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => update('userRace', undefined)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                filters.userRace === undefined
                  ? 'bg-blue-500 text-white'
                  : 'bg-zinc-800 text-white/40 hover:bg-zinc-700'
              }`}
            >
              Not Specified
            </button>
            {(['white', 'black', 'hispanic', 'asian', 'other'] as Race[]).map(race => (
              <button
                key={race}
                onClick={() => update('userRace', race)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.userRace === race
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-white/40 hover:bg-zinc-700'
                }`}
              >
                {race.charAt(0).toUpperCase() + race.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* User Age */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Your Age</label>
            <span className="text-xl font-medium text-white">{filters.userAge}</span>
          </div>
          <input 
            type="range" min="18" max="80" step="1"
            value={filters.userAge}
            onChange={(e) => {
              const newAge = parseInt(e.target.value);
              const newRange = getHealthyAgeRange(newAge);
              onChange({
                ...filters,
                userAge: newAge,
                minAge: newRange.min,
                maxAge: newRange.max
              });
            }}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* User Income */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Your Income</label>
            <span className="text-xl font-medium text-white">{formatIncome(filters.userIncome)}</span>
          </div>
          <input 
            type="range" min="0" max={city.incomeMax} step="5000"
            value={filters.userIncome}
            onChange={(e) => update('userIncome', parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* User Lifestyle Toggles */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono block mb-2">Your Lifestyle</label>
          {[
            { id: 'userNotObese', label: 'Healthy Weight' },
            { id: 'userNonSmoker', label: 'Non-Smoker' },
            { id: 'userWantsChildren', label: 'Want Children' },
          ].map(toggle => (
            <div key={toggle.id} className="space-y-1">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">{toggle.label}</span>
                <div className="relative inline-flex items-center">
                  <input 
                    type="checkbox" 
                    checked={filters[toggle.id as keyof UserFilters] as boolean}
                    onChange={(e) => update(toggle.id as keyof UserFilters, e.target.checked)}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                </div>
              </label>
            </div>
          ))}

          {/* User Secure Attachment Toggle with Tooltip */}
          <div className="relative">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Secure Attachment Type</span>
                <span 
                  onMouseEnter={() => setShowUserAttachmentTooltip(true)}
                  onMouseLeave={() => setShowUserAttachmentTooltip(false)}
                  className="text-white/20 hover:text-white/60 transition-colors cursor-help"
                >
                  <Info size={12} />
                </span>
              </div>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={filters.userSecureAttachment}
                  onChange={(e) => update('userSecureAttachment', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </div>
            </label>

            <AnimatePresence>
              {showUserAttachmentTooltip && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full left-0 mb-4 w-64 p-4 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 text-xs leading-relaxed text-white/80 text-left"
                >
                  <p className="font-bold text-white mb-1">Secure Attachment:</p>
                  Securely attached individuals are comfortable with intimacy and are generally more reliable partners. 
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="space-y-8 p-6 bg-zinc-900/50 border border-white/5 rounded-3xl backdrop-blur-xl">
        <div className="space-y-2">
          <h3 className="text-[10px] uppercase tracking-[0.2em] text-blue-500 font-mono font-bold">Your Preferences</h3>
          <p className="text-xs text-white/40 leading-relaxed">
            Set your non-negotiables. These filters directly reduce the pool of potential matches based on the local population density and demographic distributions for your chosen city.
          </p>
        </div>

        {/* Age Range */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Age Range</label>
              <p className="text-[10px] text-white/20 leading-tight max-w-[240px]">
                Narrower ranges reduce pool size. Note: Older ranges often yield higher match rates as criteria like income mature with age.
              </p>
            </div>
            <span className="text-xl font-medium text-white">{filters.minAge} - {filters.maxAge}</span>
          </div>
          <div className="flex gap-4">
            <input 
              type="range" min="18" max="80" step="1"
              value={filters.minAge}
              onChange={(e) => update('minAge', Math.min(parseInt(e.target.value), filters.maxAge - 1))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
            <input 
              type="range" min="18" max="80" step="1"
              value={filters.maxAge}
              onChange={(e) => update('maxAge', Math.max(parseInt(e.target.value), filters.minAge + 1))}
              className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Height */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Min Height</label>
              <p className="text-[10px] text-white/20 leading-tight max-w-[200px]">
                Height follows a normal distribution.
              </p>
            </div>
            <span className="text-xl font-medium text-white">{formatHeight(filters.minHeight)}</span>
          </div>
          <input 
            type="range" min="54" max="84" step="1"
            value={filters.minHeight}
            onChange={(e) => update('minHeight', parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Income */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div className="space-y-1">
              <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Min Income</label>
              <p className="text-[10px] text-white/20 leading-tight max-w-[200px]">
                Income is log-normally distributed.
              </p>
            </div>
            <span className="text-xl font-medium text-white">{formatIncome(filters.minIncome)}</span>
          </div>
          <input 
            type="range" min="0" max={city.incomeMax} step="5000"
            value={filters.minIncome}
            onChange={(e) => update('minIncome', parseInt(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Race Multi-select */}
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Race / Ethnicity</label>
            <p className="text-[10px] text-white/20 leading-tight">
              Selecting a single ethnicity significantly reduces the pool size.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['white', 'black', 'hispanic', 'asian', 'other'] as Race[]).map(race => (
              <button
                key={race}
                onClick={() => {
                  const next = filters.selectedRaces.includes(race)
                    ? filters.selectedRaces.filter(r => r !== race)
                    : [...filters.selectedRaces, race];
                  update('selectedRaces', next);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.selectedRaces.includes(race)
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-white/40 hover:bg-zinc-700'
                }`}
              >
                {race.charAt(0).toUpperCase() + race.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Sexuality Multi-select */}
        <div className="space-y-2">
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Preferred Sexuality</label>
            <p className="text-[10px] text-white/20 leading-tight">
              Select all that apply.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['straight', 'bisexual', 'gay'] as Sexuality[]).map(sex => (
              <button
                key={sex}
                onClick={() => {
                  const next = filters.selectedSexualities.includes(sex)
                    ? filters.selectedSexualities.filter(s => s !== sex)
                    : [...filters.selectedSexualities, sex];
                  // Don't allow empty selection
                  if (next.length > 0) update('selectedSexualities', next);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  filters.selectedSexualities.includes(sex)
                    ? 'bg-blue-500 text-white'
                    : 'bg-zinc-800 text-white/40 hover:bg-zinc-700'
                }`}
              >
                {sex.charAt(0).toUpperCase() + sex.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <p className="text-[10px] text-white/20 leading-tight mb-4">
            Each choice reduces the pool, but selecting multiple applies a clustering bonus to account for correlation.
          </p>
          {[
            { id: 'excludeObese', label: 'Healthy Weight' },
            { id: 'nonSmoker', label: 'Non-Smoker' },
            { id: 'wantsChildren', label: 'Want Children' },
          ].map(toggle => (
            <label key={toggle.id} className="flex items-center justify-between cursor-pointer group">
              <span className="text-sm text-white/60 group-hover:text-white transition-colors">{toggle.label}</span>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={filters[toggle.id as keyof UserFilters] as boolean}
                  onChange={(e) => update(toggle.id as keyof UserFilters, e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </div>
            </label>
          ))}

          {/* Secure Attachment Toggle with Tooltip */}
          <div className="relative">
            <label className="flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2">
                <span className="text-sm text-white/60 group-hover:text-white transition-colors">Secure Attachment Type</span>
                <span 
                  onMouseEnter={() => setShowAttachmentTooltip(true)}
                  onMouseLeave={() => setShowAttachmentTooltip(false)}
                  className="text-white/20 hover:text-white/60 transition-colors cursor-help"
                >
                  <Info size={12} />
                </span>
              </div>
              <div className="relative inline-flex items-center">
                <input 
                  type="checkbox" 
                  checked={filters.secureAttachment}
                  onChange={(e) => update('secureAttachment', e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
              </div>
            </label>

            <AnimatePresence>
              {showAttachmentTooltip && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute bottom-full left-0 mb-4 w-64 p-4 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 text-xs leading-relaxed text-white/80 text-left"
                >
                  <p className="font-bold text-white mb-1">Secure Attachment:</p>
                  Securely attached individuals are comfortable with intimacy and are generally more reliable partners. 
                  <p className="mt-2 text-blue-400">This reduces the pool by 70% as they exit the dating pool faster. However, if you are also secure, your compatibility with this pool is significantly higher (50% reduction instead of 70%).</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
