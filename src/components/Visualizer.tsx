import { motion, useSpring, useTransform, animate } from 'motion/react';
import { useEffect, useRef } from 'react';

export function RollingCounter({ value, decimals = 0, suffix = "" }: { value: number, decimals?: number, suffix?: string }) {
  const countRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = countRef.current;
    if (!node) return;

    const controls = animate(parseFloat(node.textContent?.replace(/[^\d.]/g, '') || '0'), value, {
      duration: 1,
      onUpdate(v) {
        node.textContent = v.toFixed(decimals) + suffix;
      },
    });

    return () => controls.stop();
  }, [value, decimals, suffix]);

  return <span ref={countRef}>0{suffix}</span>;
}

export function MatchRateSlider({ probability }: { probability: number }) {
  const percentage = Math.min(100, probability * 100);
  
  const getColor = (p: number) => {
    if (p < 1) return '#ef4444'; // Red
    if (p < 5) return '#f97316'; // Orange
    if (p < 15) return '#eab308'; // Yellow
    return '#22c55e'; // Green
  };

  const getLabel = (p: number) => {
    if (p < 1) return 'Extreme';
    if (p < 5) return 'High';
    if (p < 15) return 'Moderate';
    return 'Open';
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 pt-8">
      <div className="relative h-3 bg-zinc-800 rounded-full overflow-hidden">
        {/* Background segments for visual depth */}
        <div className="absolute inset-0 flex">
          <div className="h-full w-[1%] bg-red-500/10 border-r border-black/20" />
          <div className="h-full w-[4%] bg-orange-500/10 border-r border-black/20" />
          <div className="h-full w-[10%] bg-yellow-500/10 border-r border-black/20" />
          <div className="h-full flex-1 bg-green-500/10" />
        </div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 50, damping: 20 }}
          style={{ backgroundColor: getColor(percentage) }}
          className="absolute h-full rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]"
        />
      </div>

      <div className="flex justify-start items-center px-1">
        <div className="flex flex-col items-start">
          <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">Selectivity</span>
          <span className="text-sm font-medium text-white" style={{ color: getColor(percentage) }}>
            {getLabel(percentage)}
          </span>
        </div>
      </div>
    </div>
  );
}
