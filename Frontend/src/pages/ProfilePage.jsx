import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { apiClient } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, Link, CheckCircle, AlertCircle } from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();
  const [syncing, setSyncing] = useState({});
  const [linkedAccounts, setLinkedAccounts] = useState({});
  const [loading, setLoading] = useState(true);

  const platforms = [
    { key: 'cf', name: 'Codeforces', icon: '⚡', color: 'blue' },
    { key: 'lc', name: 'LeetCode', icon: '🔥', color: 'yellow' },
    { key: 'cc', name: 'CodeChef', icon: '👨‍💻', color: 'orange' },
  ];

  useEffect(() => {
    fetchLinkedAccounts();
  }, []);

  const fetchLinkedAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get('/auth/me');
      const accounts = {};
      
      if (res.data.user?.platformAccounts) {
        res.data.user.platformAccounts.forEach(acc => {
          accounts[acc.platform] = acc.handle;
        });
      }
      
      setLinkedAccounts(accounts);
    } catch (err) {
      console.error('Failed to fetch linked accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (platform) => {
    setSyncing(prev => ({ ...prev, [platform]: true }));
    try {
      const endpoint = platform === 'cf' 
        ? '/submissions/sync/codeforces'
        : platform === 'lc'
        ? '/submissions/sync/leetcode'
        : '/submissions/sync/codechef';

      await apiClient.post(endpoint);
      alert(`${platforms.find(p => p.key === platform)?.name} submissions synced successfully!`);
    } catch (err) {
      console.error(`Failed to sync ${platform}:`, err);
      alert(`Failed to sync: ${err.response?.data?.error || err.message}`);
    } finally {
      setSyncing(prev => ({ ...prev, [platform]: false }));
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Account</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">Profile</h1>
      </div>

      <div className="space-y-6">
        <div className="border border-neutral-700/30 rounded p-6">
          <h2 className="text-xl font-semibold text-white mb-4">User Information</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/50">Username:</span>
              <span className="text-white">{user?.username || '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/50">Email:</span>
              <span className="text-white">{user?.email || '—'}</span>
            </div>
          </div>
        </div>

        <div className="border border-neutral-700/30 rounded p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-white">Platform Accounts</h2>
              <p className="text-sm text-white/50 mt-1">Manage and sync your coding platform accounts</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <p className="text-white/50">Loading...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {platforms.map((platform) => (
                <div
                  key={platform.key}
                  className="flex items-center justify-between p-4 border border-neutral-700/30 rounded hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <h3 className="text-white font-medium">{platform.name}</h3>
                      {linkedAccounts[platform.key] ? (
                        <div className="flex items-center gap-2 mt-1">
                          <CheckCircle size={14} className="text-emerald-400" />
                          <span className="text-sm text-white/70">
                            @{linkedAccounts[platform.key]}
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 mt-1">
                          <AlertCircle size={14} className="text-yellow-400" />
                          <span className="text-sm text-white/50">Not linked</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {linkedAccounts[platform.key] ? (
                      <button
                        onClick={() => handleSync(platform.key)}
                        disabled={syncing[platform.key]}
                        className="px-4 py-2 rounded border border-yellow-500/50 bg-yellow-500/20 text-yellow-300 hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-mono flex items-center gap-2"
                      >
                        <RefreshCw size={16} className={syncing[platform.key] ? 'animate-spin' : ''} />
                        {syncing[platform.key] ? 'Syncing...' : 'Sync Now'}
                      </button>
                    ) : (
                      <a
                        href="/link-platforms"
                        className="px-4 py-2 rounded border border-neutral-700/30 text-white/70 hover:border-white/30 hover:bg-white/5 transition-colors text-sm font-mono flex items-center gap-2"
                      >
                        <Link size={16} />
                        Link Account
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded">
            <p className="text-sm text-blue-300">
              💡 <strong>Tip:</strong> After linking your accounts, click "Sync Now" to fetch your solved problems and update your stats.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
