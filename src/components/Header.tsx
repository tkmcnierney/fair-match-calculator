import { Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';

interface Props {
  baselineRange: { min: number; max: number };
}

export function Header({ baselineRange }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-4"
      >
        The Fair Match Calculator
      </motion.h1>
      <div className="relative flex items-center gap-2 text-white/60 text-sm font-medium">
        <span>A realistic look at your local dating pool</span>
        <button 
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          className="p-1 hover:text-white transition-colors"
        >
          <Info size={16} />
        </button>
        
        <AnimatePresence>
          {showTooltip && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-4 bg-zinc-900 border border-white/10 rounded-xl shadow-2xl z-50 text-xs leading-relaxed text-white/80"
            >
              <p className="font-bold text-white mb-1">Why this is fair:</p>
              We define your "fair baseline" as the local population of your desired gender within a healthy age range for your age, <span className="text-blue-400">excluding those already in relationships</span>. 
              <p className="mt-2 text-blue-400 font-medium">Your current baseline: {baselineRange.min} - {baselineRange.max} years old.</p>
              <p className="mt-2">Widening this range increases your pool, while narrowing it acts as a filter on your baseline.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
