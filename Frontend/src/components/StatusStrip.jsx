import React from 'react';
import { Flame } from 'lucide-react';

export const StatusStrip = ({ stats }) => {
  return (
    <div className="grid grid-cols-3 gap-4 md:gap-0 md:flex md:items-center md:gap-8 py-6 border-b border-neutral-700/30">
      <div>
        <p className="text-xs text-white/50 uppercase tracking-wider mb-1">Total Solved</p>
        <p className="text-2xl md:text-3xl font-mono font-bold text-white">
          {stats?.totalSolved || 0}
        </p>
      </div>

      <div className="hidden md:block w-px h-12 bg-neutral-700/30" />

      <div>
        <p className="text-xs text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Flame size={14} className="text-yellow-300" />
          Current Streak
        </p>
        <p className="text-2xl md:text-3xl font-mono font-bold text-white">
          {stats?.currentStreak || 0}
        </p>
      </div>

      <div className="hidden md:block w-px h-12 bg-neutral-700/30" />

      <div>
        <p className="text-xs text-white/50 uppercase tracking-wider mb-1 flex items-center gap-1">
          <Flame size={14} className="text-orange-300" />
          Max Streak
        </p>
        <p className="text-2xl md:text-3xl font-mono font-bold text-white">
          {stats?.maxStreak || 0}
        </p>
      </div>
    </div>
  );
};
