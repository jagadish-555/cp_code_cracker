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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <p className="font-mono font-semibold text-white text-lg">Codeforces</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-white/70">Solved</p>
              <p className="font-mono font-bold text-white">{stats?.codeforces?.solved || 0}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Current Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codeforces?.currentRating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Max Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codeforces?.maxRating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Title</p>
              <p className="font-mono font-bold text-yellow-300">{stats?.codeforces?.title || '—'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🔥</span>
            <p className="font-mono font-semibold text-white text-lg">LeetCode</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-white/70">Rating</p>
              <p className="font-mono font-bold text-white">{stats?.leetcode?.rating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Total Solved</p>
              <p className="font-mono font-bold text-white">{stats?.leetcode?.totalSolved || 0}</p>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-white/70 text-xs font-semibold">Difficulty Breakdown</p>
              
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-emerald-400">● Easy</span>
                  <span className="text-xs text-white/70 font-mono">{stats?.leetcode?.easySolved || 0}</span>
                </div>
                <div className="h-1.5 bg-neutral-700/50 rounded overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500/70"
                    style={{ width: `${stats?.leetcode?.totalSolved ? Math.round((stats.leetcode.easySolved / stats.leetcode.totalSolved) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-yellow-400">● Medium</span>
                  <span className="text-xs text-white/70 font-mono">{stats?.leetcode?.mediumSolved || 0}</span>
                </div>
                <div className="h-1.5 bg-neutral-700/50 rounded overflow-hidden">
                  <div 
                    className="h-full bg-yellow-500/70"
                    style={{ width: `${stats?.leetcode?.totalSolved ? Math.round((stats.leetcode.mediumSolved / stats.leetcode.totalSolved) * 100) : 0}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-red-400">● Hard</span>
                  <span className="text-xs text-white/70 font-mono">{stats?.leetcode?.hardSolved || 0}</span>
                </div>
                <div className="h-1.5 bg-neutral-700/50 rounded overflow-hidden">
                  <div 
                    className="h-full bg-red-500/70"
                    style={{ width: `${stats?.leetcode?.totalSolved ? Math.round((stats.leetcode.hardSolved / stats.leetcode.totalSolved) * 100) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">👨‍💻</span>
            <p className="font-mono font-semibold text-white text-lg">CodeChef</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <p className="text-white/70">Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codechef?.rating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Max Rating</p>
              <p className="font-mono font-bold text-white">{stats?.codechef?.maxRating || '—'}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Total Solved</p>
              <p className="font-mono font-bold text-white">{stats?.codechef?.totalSolved || 0}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-white/70">Stars</p>
              <p className="font-mono font-bold text-yellow-300">
                {'⭐'.repeat(Math.min(stats?.codechef?.stars || 0, 5))}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
