import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProfileHero } from '../components/ProfileHero';
import { StatusStrip } from '../components/StatusStrip';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Link as LinkIcon, CheckCircle, AlertCircle, Check, X } from 'lucide-react';

const platforms = [
  { key: 'cf', name: 'Codeforces', icon: '⚡' },
  { key: 'lc', name: 'LeetCode', icon: '🔥' },
  { key: 'cc', name: 'CodeChef', icon: '👨‍💻' },
];

const SkeletonBlock = ({ className = '' }) => (
  <div className={`animate-pulse bg-white/5 rounded ${className}`} />
);

export const ProfilePage = () => {
  const { user } = useAuth();

  const [linkedAccounts, setLinkedAccounts] = useState({});
  const [statsData, setStatsData] = useState(null);
  const [heatmapData, setHeatmapData] = useState([]);

  const [loading, setLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  const [syncing, setSyncing] = useState({});
  const [syncResult, setSyncResult] = useState({}); // { cf: 'success' | 'error' }

  // ── Fetch all profile data ───────────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await apiClient.get('/auth/me');
        const u = res.data.user;

        // Linked accounts map
        const accounts = {};
        u.platformAccounts?.forEach((a) => (accounts[a.platform] = a.handle));
        setLinkedAccounts(accounts);

        // Stats strip
        const totalSolved = u.userProblems?.filter((p) => p.status === 'solved')?.length || 0;
        setStatsData({
          totalSolved,
          currentStreak: u.streak?.currentStreak || 0,
          maxStreak: u.streak?.maxStreak || u.streak?.longestStreak || 0,
        });


      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchHeatmap = async () => {
      try {
        setHeatmapLoading(true);
        const res = await apiClient.get('/submissions/heatmap');
        setHeatmapData(res.data || {});
      } catch (err) {
        console.error('Failed to load heatmap:', err);
      } finally {
        setHeatmapLoading(false);
      }
    };

    Promise.all([fetchProfile(), fetchHeatmap()]);
  }, []);

  // ── Sync handler ─────────────────────────────────────────────
  const handleSync = async (platformKey) => {
    const platformName = platforms.find((p) => p.key === platformKey)?.name;
    setSyncing((prev) => ({ ...prev, [platformKey]: true }));
    setSyncResult((prev) => ({ ...prev, [platformKey]: null }));
    try {
      const endpoint =
        platformKey === 'cf'
          ? '/submissions/sync/codeforces'
          : platformKey === 'lc'
          ? '/submissions/sync/leetcode'
          : '/submissions/sync/codechef';

      await apiClient.post(endpoint);
      setSyncResult((prev) => ({ ...prev, [platformKey]: 'success' }));
    } catch (err) {
      console.error(`Failed to sync ${platformName}:`, err);
      setSyncResult((prev) => ({ ...prev, [platformKey]: 'error' }));
    } finally {
      setSyncing((prev) => ({ ...prev, [platformKey]: false }));
      // Clear result after 4 seconds
      setTimeout(() => setSyncResult((prev) => ({ ...prev, [platformKey]: null })), 4000);
    }
  };

  // ── Render ───────────────────────────────────────────────────
  return (
    <DashboardLayout>
      {/* Page header */}
      <div className="mb-8">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Account</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">Profile</h1>
      </div>

      <div className="space-y-8">
        {/* ── Hero card ─────────────────────────────────────── */}
        {loading ? (
          <div className="border border-neutral-700/30 rounded-lg p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              <SkeletonBlock className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3 w-full">
                <SkeletonBlock className="h-8 w-48" />
                <SkeletonBlock className="h-4 w-36" />
                <SkeletonBlock className="h-4 w-28" />
              </div>
            </div>
          </div>
        ) : (
          <ProfileHero user={user} linkedAccounts={linkedAccounts} />
        )}

        {/* ── Stats strip ───────────────────────────────────── */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4 py-6 border-b border-neutral-700/30">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <SkeletonBlock className="h-3 w-20" />
                <SkeletonBlock className="h-8 w-16" />
              </div>
            ))}
          </div>
        ) : (
          statsData && <StatusStrip stats={statsData} />
        )}

        {/* ── Activity heatmap ──────────────────────────────── */}
        <ActivityHeatmap data={heatmapData} loading={heatmapLoading} />

        {/* ── Platform accounts management ──────────────────── */}
        <div className="pt-2">
          <p className="text-xs text-white/50 uppercase tracking-wider mb-4">Connected Platforms</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {platforms.map((platform) => {
              const linked = !!linkedAccounts[platform.key];
              const isSyncing = syncing[platform.key];
              const result = syncResult[platform.key];

              return (
                <div
                  key={platform.key}
                  className="border border-neutral-700/30 rounded-lg p-5 hover:border-neutral-600/50 transition-colors"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-2xl">{platform.icon}</span>
                    <div>
                      <h3 className="text-white font-semibold text-sm">{platform.name}</h3>
                      {linked ? (
                        <p className="text-xs text-white/50 font-mono">@{linkedAccounts[platform.key]}</p>
                      ) : (
                        <p className="text-xs text-white/30">Not linked</p>
                      )}
                    </div>
                    <div className="ml-auto">
                      {linked ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 block" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-neutral-600 block" />
                      )}
                    </div>
                  </div>

                  {linked ? (
                    <div className="space-y-2">
                      <button
                        onClick={() => handleSync(platform.key)}
                        disabled={isSyncing}
                        className="w-full px-3 py-2 rounded border border-neutral-700/40 bg-white/5 text-white/80 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-xs font-mono flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={13} className={isSyncing ? 'animate-spin' : ''} />
                        {isSyncing ? 'Syncing...' : 'Sync Now'}
                      </button>

                      {/* Inline feedback */}
                      {result === 'success' && (
                        <p className="text-xs text-emerald-400 flex items-center gap-1 justify-center">
                          <Check size={12} /> Synced successfully
                        </p>
                      )}
                      {result === 'error' && (
                        <p className="text-xs text-red-400 flex items-center gap-1 justify-center">
                          <X size={12} /> Sync failed — try again
                        </p>
                      )}
                    </div>
                  ) : (
                    <a
                      href="/link-platforms"
                      className="w-full px-3 py-2 rounded border border-accent/30 bg-accent/10 text-accent hover:bg-accent/20 transition-colors text-xs font-mono flex items-center justify-center gap-2"
                    >
                      <LinkIcon size={13} />
                      Link Account
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
