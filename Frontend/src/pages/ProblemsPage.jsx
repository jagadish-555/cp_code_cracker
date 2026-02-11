import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { apiClient } from '../api/client';
import { ExternalLink, Filter } from 'lucide-react';
import { codeforcesLogo, codechefLogo, leetcodeLogo } from '../assets';

const getDifficultyColor = (difficulty) => {
  if (!difficulty) return 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20';
  const lower = difficulty.toLowerCase();
  if (lower === 'easy' || lower === '800' || lower === '900') return 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20';
  if (lower === 'medium' || lower === '1000' || lower === '1100' || lower === '1200') return 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20';
  if (lower === 'hard' || parseInt(lower) >= 1300) return 'bg-red-500/10 text-red-400 border-red-400/20';
  return 'bg-neutral-500/10 text-neutral-400 border-neutral-400/20';
};

const getPlatformIcon = (platform) => {
  const icons = {
    cf: <img src={codeforcesLogo} alt="Codeforces" className="w-5 h-5" />,
    lc: <img src={leetcodeLogo} alt="LeetCode" className="w-5 h-5" />,
    cc: <img src={codechefLogo} alt="CodeChef" className="w-5 h-5" />,
  };
  return icons[platform?.toLowerCase()] ;
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

export const ProblemsPage = () => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const platforms = [
    { value: 'all', label: 'All Platforms', icon: '' },
    { value: 'cf', label: 'Codeforces', icon: <img src={codeforcesLogo} alt="Codeforces" className="w-6 h-6" /> },
    { value: 'lc', label: 'LeetCode', icon: <img src={leetcodeLogo} alt="LeetCode" className="w-6 h-6" /> },
    { value: 'cc', label: 'CodeChef', icon: <img src={codechefLogo} alt="CodeChef" className="w-6 h-6" /> },
  ];

  useEffect(() => {
    fetchProblems();
  }, [selectedPlatform, page]);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
      };

      if (selectedPlatform !== 'all') {
        params.platform = selectedPlatform;
      }

      const res = await apiClient.get('/submissions/solved', { params });
      setProblems(res.data.problems || []);
      setTotalPages(res.data.totalPages || 1);
      setTotalCount(res.data.totalCount || 0);
    } catch (err) {
      console.error('Failed to load problems:', err);
      setProblems([]);
      setTotalPages(1);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  const handlePlatformChange = (platform) => {
    setSelectedPlatform(platform);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Browse</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">Problems</h1>
      </div>

      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-white/50" />
            <p className="text-xs text-white/50 uppercase tracking-wider">Filter by Platform</p>
          </div>
          {totalCount > 0 && (
            <p className="text-xs text-white/50">
              {totalCount} problem{totalCount !== 1 ? 's' : ''} solved
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {platforms.map((platform) => (
            <button
              key={platform.value}
              onClick={() => handlePlatformChange(platform.value)}
              className={`px-4 py-2 rounded border text-sm font-mono transition-colors ${
                selectedPlatform === platform.value
                  ? 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                  : 'bg-neutral-800/50 border-neutral-700/30 text-white/70 hover:border-white/30 hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{platform.icon}</span>
              {platform.label}
            </button>
          ))}
        </div>
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
                    Problem
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Platform
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-semibold text-white/70 uppercase tracking-wider">
                    Status
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
                        className="text-white hover:text-yellow-300 transition truncate max-w-xs text-sm inline-flex items-center gap-2 group"
                      >
                        <span className="truncate">{problem.title}</span>
                        <ExternalLink size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(problem.platform)}</span>
                        <span className="text-sm text-white/70 uppercase font-mono">{problem.platform}</span>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded border inline-block ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded border inline-block ${
                        problem.status === 'solved' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-400/20'
                          : 'bg-yellow-500/10 text-yellow-400 border-yellow-400/20'
                      }`}>
                        {problem.status || 'Unsolved'}
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
            <div className="flex justify-between items-center mt-6">
              <p className="text-sm text-white/50">
                Page {page} of {totalPages} • Showing {problems.length} of {totalCount} problems
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 rounded border border-neutral-700/30 text-white/70 hover:border-white/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-mono"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className="px-4 py-2 rounded border border-neutral-700/30 text-white/70 hover:border-white/30 hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-mono"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex justify-center items-center py-24 border border-neutral-700/30 rounded">
          <div className="text-center">
            <p className="text-white/50 text-lg mb-2">
              {selectedPlatform === 'all' 
                ? 'No problems solved yet' 
                : `No ${platforms.find(p => p.value === selectedPlatform)?.label} problems found`
              }
            </p>
            <p className="text-white/40 text-sm">
              {selectedPlatform === 'all'
                ? 'Start solving problems and sync your submissions to see them here'
                : 'Try syncing your submissions or select a different platform'
              }
            </p>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
