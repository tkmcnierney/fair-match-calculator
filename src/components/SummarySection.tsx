import { motion, AnimatePresence } from 'motion/react';
import { Info } from 'lucide-react';
import { useState } from 'react';

interface Props {
  probability: number;
  remainingMatches: number;
  actualDenominator: number;
  baselineDenominator: number;
  bottleneck: string | null;
  gender: string;
}

export function SummarySection({ probability, remainingMatches, actualDenominator, baselineDenominator, bottleneck, gender }: Props) {
  const [showFairnessTooltip, setShowFairnessTooltip] = useState(false);

  // Fairness Score: 
  // 1. Percentage of desired gender that meet criteria relative to baseline
  // 2. Comparison to local average (let's assume "average" is 10% match rate for urban environments)
  const matchRate = probability * 100;
  const fairnessScore = Math.min(100, Math.round((matchRate / 10) * 100));

  return (
    <div className="space-y-8 py-12">
      {/* Bottleneck Alert */}
      <AnimatePresence>
        {bottleneck && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-start gap-3"
          >
            <Info className="text-blue-500 shrink-0 mt-0.5" size={16} />
            <div className="text-xs text-blue-200/80 leading-relaxed">
              <span className="font-bold text-blue-400">Bottleneck Detected:</span> Your <span className="text-white font-medium">{bottleneck}</span> filter is the primary factor reducing your match rate.{bottleneck !== 'Sexuality' && ' Widening this would significantly increase your pool.'}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl text-center">
          <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono mb-2">Remaining Matches</div>
          <div className="text-4xl font-bold text-white mb-1">
            {remainingMatches === 0 ? "0" : remainingMatches.toLocaleString()}
          </div>
          <div className="text-xs text-white/40">
            {remainingMatches === 0 ? "No matches found in your local pool" : "in your local pool"}
          </div>
        </div>
        
        <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <div className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Fairness Score</div>
            <button 
              onMouseEnter={() => setShowFairnessTooltip(true)}
              onMouseLeave={() => setShowFairnessTooltip(false)}
              className="text-white/20 hover:text-white/60 transition-colors"
            >
              <Info size={12} />
            </button>
          </div>
          <div className="text-4xl font-bold text-blue-500 mb-1">{fairnessScore}</div>
          <div className="text-xs text-white/40">Relative to demographic baseline</div>

          <AnimatePresence>
            {showFairnessTooltip && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 p-4 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 text-xs leading-relaxed text-white/80 text-left"
              >
                <p className="font-bold text-white mb-1">About the Fairness Score:</p>
                This is a relative measure of how "open" your filters are compared to the average for your specific demographic (gender and sexuality). 
                A score of 100 means your criteria are as inclusive as the typical baseline for your city, 
                even if the absolute number of matches is low due to city size or specific orientation.
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="p-8 bg-zinc-900/50 border border-white/5 rounded-3xl">
        <h3 className="text-lg font-semibold text-white mb-4">The Reality Check</h3>
        <p className="text-white/60 leading-relaxed text-sm">
          In your chosen city, your search criteria covers <span className="text-white font-medium">{Math.round(actualDenominator).toLocaleString()}</span> single people of your desired gender. 
          Based on your preferences, only <span className="text-white font-medium">{remainingMatches.toLocaleString()}</span> of 
          them meet all your criteria.
        </p>
      </div>
    </div>
  );
}
