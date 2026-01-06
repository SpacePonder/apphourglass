
import React from 'react';
import { Hourglass as HourglassIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Hourglass = ({ isRunning, onClick, className }) => {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "group relative flex items-center justify-center hover:bg-gray-50 transition-colors", 
        className
      )}
      aria-label={isRunning ? "Finish Session" : "Start Session"}
    >
      <HourglassIcon 
        className={cn(
          "w-6 h-6 text-black transition-all",
          isRunning && "animate-spin"
        )} 
        style={isRunning ? { animationDuration: '3s' } : {}}
      />
      {/* Tooltip-ish hint */}
      <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none uppercase tracking-widest z-50">
        {isRunning ? 'Finish' : 'Start'}
      </span>
    </button>
  );
};
