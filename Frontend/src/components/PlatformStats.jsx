import React from 'react';

const getDifficultyColor = (difficulty) => {
  if (!difficulty) return 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20';
  const lower = difficulty.toLowerCase();
  if (lower === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20';
  if (lower === 'medium') return 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20';
  if (lower === 'hard') return 'bg-red-500/10 text-red-400 border-red-400/20';
  return 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20';
};

export const PlatformStats = ({ stats }) => {
  return (
    <div className="py-8 border-b border-neutral-700/30">
      <p className="text-xs text-white/50 uppercase tracking-wider mb-6">Platform Stats</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="border border-neutral-700/30 rounded-lg bg-white/5 p-5 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-neutral-700/30">
            <span className="text-2xl">⚡</span>
            <p className="font-mono font-bold text-white">Codeforces</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Problems Solved</p>
              <p className="font-mono font-bold text-white text-lg">{stats?.codeforces?.solved || 0}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Current Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codeforces?.currentRating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Max Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codeforces?.maxRating || '—'}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-700/30">
              <p className="text-white/50 text-xs uppercase tracking-wide">Rank</p>
              <p className="font-mono font-bold text-yellow-300">{stats?.codeforces?.title || '—'}</p>
            </div>
          </div>
        </div>

        <div className="border border-neutral-700/30 rounded-lg bg-white/5 p-5 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-neutral-700/30">
            <span className="text-2xl">🔥</span>
            <p className="font-mono font-bold text-white">LeetCode</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Problems Solved</p>
              <p className="font-mono font-bold text-white text-lg">{stats?.leetcode?.totalSolved || 0}</p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-neutral-700/30">
              <p className="text-white/50 text-xs uppercase tracking-wide">Contest Rating</p>
              <p className="font-mono font-bold text-white">{stats?.leetcode?.rating || '—'}</p>
            </div>

            <div className="pt-1 space-y-2.5">
              <p className="text-white/50 text-[10px] uppercase tracking-wider mb-3">Difficulty Split</p>
              
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-400 font-medium">Easy</span>
                  <span className="text-xs text-white/70 font-mono">{stats?.leetcode?.easySolved || 0}</span>
                </div>
                <div className="h-1.5 bg-neutral-700/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${stats?.leetcode?.totalSolved ? Math.round((stats.leetcode.easySolved / stats.leetcode.totalSolved) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-yellow-400 font-medium">Medium</span>
                  <span className="text-xs text-white/70 font-mono">{stats?.leetcode?.mediumSolved || 0}</span>
                </div>
                <div className="h-1.5 bg-neutral-700/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-yellow-400 rounded-full transition-all"
                    style={{ width: `${stats?.leetcode?.totalSolved ? Math.round((stats.leetcode.mediumSolved / stats.leetcode.totalSolved) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-400 font-medium">Hard</span>
                  <span className="text-xs text-white/70 font-mono">{stats?.leetcode?.hardSolved || 0}</span>
                </div>
                <div className="h-1.5 bg-neutral-700/30 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-red-400 rounded-full transition-all"
                    style={{ width: `${stats?.leetcode?.totalSolved ? Math.round((stats.leetcode.hardSolved / stats.leetcode.totalSolved) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border border-neutral-700/30 rounded-lg bg-white/5 p-5 hover:border-neutral-600/50 transition-colors">
          <div className="flex items-center gap-2.5 mb-5 pb-4 border-b border-neutral-700/30">
            <span className="text-2xl">👨‍💻</span>
            <p className="font-mono font-bold text-white">CodeChef</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Problems Solved</p>
              <p className="font-mono font-bold text-white text-lg">{stats?.codechef?.totalSolved || 0}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Current Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codechef?.rating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/50 text-xs uppercase tracking-wide">Max Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codechef?.maxRating || '—'}</p>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-neutral-700/30">
              <p className="text-white/50 text-xs uppercase tracking-wide">Stars</p>
              <p className="font-mono font-bold text-yellow-300 text-base">
                {'⭐'.repeat(Math.min(stats?.codechef?.stars || 0, 7))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
