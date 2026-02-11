import React from 'react';
import { Calendar, CheckCircle, AlertCircle } from 'lucide-react';

const platformMeta = {
  cf: { name: 'Codeforces', icon: '⚡', color: 'text-blue-400' },
  lc: { name: 'LeetCode', icon: '🔥', color: 'text-yellow-400' },
  cc: { name: 'CodeChef', icon: '👨‍💻', color: 'text-orange-400' },
};

const gradients = [
  'from-blue-500 to-purple-600',
  'from-emerald-500 to-cyan-600',
  'from-orange-500 to-pink-600',
  'from-indigo-500 to-blue-600',
  'from-rose-500 to-amber-600',
];

const pickGradient = (name) => {
  if (!name) return gradients[0];
  const code = name.charCodeAt(0) + (name.charCodeAt(1) || 0);
  return gradients[code % gradients.length];
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
};

export const ProfileHero = ({ user, linkedAccounts }) => {
  const initial = user?.username?.charAt(0)?.toUpperCase() || '?';
  const gradient = pickGradient(user?.username);

  return (
    <div className="border border-neutral-700/30 rounded-lg overflow-hidden">
      {/* Accent banner */}
      <div className={`h-1.5 bg-gradient-to-r ${gradient}`} />

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
          {/* Avatar */}
          <div
            className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 ring-2 ring-white/10`}
          >
            <span className="text-3xl md:text-4xl font-bold font-mono text-white select-none">
              {initial}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white font-heading">
              {user?.username || 'Unknown'}
            </h2>
            <p className="text-white/50 text-sm mt-1">{user?.email}</p>

            <div className="flex items-center justify-center md:justify-start gap-1.5 mt-2 text-white/40 text-xs">
              <Calendar size={12} />
              <span>Member since {formatDate(user?.createdAt)}</span>
            </div>

            {/* Platform badges */}
            <div className="flex items-center justify-center md:justify-start gap-3 mt-4 flex-wrap">
              {Object.entries(platformMeta).map(([key, meta]) => {
                const linked = !!linkedAccounts[key];
                return (
                  <div
                    key={key}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
                      linked
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-neutral-700/40 bg-white/5 text-white/40'
                    }`}
                  >
                    <span>{meta.icon}</span>
                    <span>{meta.name}</span>
                    {linked ? (
                      <CheckCircle size={11} className="text-emerald-400" />
                    ) : (
                      <AlertCircle size={11} className="text-white/30" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
