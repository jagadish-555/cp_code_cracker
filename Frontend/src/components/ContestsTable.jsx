import React from 'react';
import { Clock, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

const getPlatformIcon = (platform) => {
  const lower = platform?.toLowerCase() || '';
  if (lower.includes('codeforces')) return '⚡';
  if (lower.includes('leetcode')) return '🔥';
  if (lower.includes('codechef')) return '👨‍💻';
  return '📋';
};

const getPlatformColor = (platform) => {
  const lower = platform?.toLowerCase() || '';
  if (lower.includes('codeforces')) return 'text-blue-400';
  if (lower.includes('leetcode')) return 'text-orange-400';
  if (lower.includes('codechef')) return 'text-yellow-400';
  return 'text-white/70';
};

const formatTimeUntil = (startTime) => {
  if (!startTime) return '—';
  const start = new Date(startTime);
  const now = new Date();
  const diff = start - now;

  if (diff < 0) return 'Ended';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

const formatDate = (dateString) => {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const ContestsTable = ({ contests, loading }) => {
  return (
    <div className="py-8">
      <div className="mb-6">
        <p className="text-xs text-white/50 uppercase tracking-wider">Upcoming Contests</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/50">Loading contests...</p>
        </div>
      ) : contests && contests.length > 0 ? (
        <div className="overflow-x-auto border border-neutral-700/30 rounded">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-700/30 bg-white/5">
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Contest
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Platform
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Starts In
                </th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {contests.map((contest, idx) => (
                <motion.tr
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="border-b border-neutral-700/30 hover:bg-white/5 transition-colors"
                >
                  <td className="px-4 md:px-6 py-4">
                    <a
                      href={contest.href || contest.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-yellow-300 font-mono text-sm truncate max-w-xs inline-flex items-center gap-1 transition-colors group"
                    >
                      <span className="truncate">{contest.event || contest.name}</span>
                      <ExternalLink size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </a>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getPlatformIcon(contest.resource || contest.platform)}</span>
                      <span className={`text-xs font-mono uppercase ${getPlatformColor(contest.resource || contest.platform)}`}>
                        {contest.resource || contest.platform}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <p className="text-white/70 text-xs font-mono">{formatDate(contest.startTime)}</p>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-400 text-xs font-mono border border-yellow-500/20">
                      {formatTimeUntil(contest.startTime)}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-white/70">
                    {contest.duration ? `${Math.round(contest.duration / 60)} min` : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="flex justify-center items-center py-12 border border-neutral-700/30 rounded">
          <p className="text-white/50">No upcoming contests</p>
        </div>
      )}
    </div>
  );
};
