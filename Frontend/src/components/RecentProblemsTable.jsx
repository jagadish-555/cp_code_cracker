import React, { useState } from 'react';

const getDifficultyColor = (difficulty) => {
  if (!difficulty) return 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20';
  const lower = difficulty.toLowerCase();
  if (lower === 'easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20';
  if (lower === 'medium') return 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20';
  if (lower === 'hard') return 'bg-red-500/10 text-red-400 border-red-400/20';
  return 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20';
};

const formatDate = (date) => {
  if (!date) return '—';
  const d = new Date(date);
  const now = new Date();
  const diff = now - d;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'today';
  if (days === 1) return '1 day ago';
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months === 1) return '1 month ago';
  return `${months} months ago`;
};

export const RecentProblemsTable = ({ problems, loading, onPageChange, page, totalPages }) => {
  return (
    <div className="py-8">
      <div className="mb-6">
        <p className="text-xs text-white/50 uppercase tracking-wider">Recent Problems Solved</p>
        <p className="text-3xl font-bold text-white mt-2">My Solutions</p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/50">Loading problems...</p>
        </div>
      ) : problems && problems.length > 0 ? (
        <>
          <div className="overflow-x-auto border border-neutral-700/30 rounded">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-700/30 bg-white/5">
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Problem Name
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Solved
                  </th>
                </tr>
              </thead>
              <tbody>
                {problems.map((problem, idx) => (
                  <tr
                    key={idx}
                    className="border-b border-neutral-700/30 hover:bg-white/5 transition-colors"
                  >
                    <td className="px-4 md:px-6 py-4">
                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-yellow-300 transition truncate block max-w-xs text-sm"
                      >
                        {problem.title}
                      </a>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-white/70">
                      {problem.platform}
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded border inline-block ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 text-sm text-white/70">
                      {formatDate(problem.solvedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-6">
              <button
                onClick={() => onPageChange(page - 1)}
                disabled={page === 1}
                className="px-4 py-2 text-sm rounded border border-neutral-700/30 text-white/70 hover:text-white hover:border-neutral-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Previous
              </button>
              <p className="text-sm text-white/70">
                Page {page} of {totalPages}
              </p>
              <button
                onClick={() => onPageChange(page + 1)}
                disabled={page === totalPages}
                className="px-4 py-2 text-sm rounded border border-neutral-700/30 text-white/70 hover:text-white hover:border-neutral-600/50 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center py-12">
          <p className="text-white/50">No problems solved yet. Start solving!</p>
        </div>
      )}
    </div>
  );
};
