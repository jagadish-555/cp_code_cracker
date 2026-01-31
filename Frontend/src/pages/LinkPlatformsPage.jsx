import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, authApi } from '../api/client';

export const LinkPlatformsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [handles, setHandles] = useState({
    codeforces: '',
    leetcode: '',
    codechef: '',
  });
  const [loading, setLoading] = useState({
    codeforces: false,
    leetcode: false,
    codechef: false,
  });
  const [status, setStatus] = useState({
    codeforces: null,
    leetcode: null,
    codechef: null,
  });
  const [errors, setErrors] = useState({
    codeforces: null,
    leetcode: null,
    codechef: null,
  });
  const [linkedCount, setLinkedCount] = useState(0);

  const platforms = [
    {
      key: 'codeforces',
      name: 'Codeforces',
      icon: '⚡',
      placeholder: 'e.g., tourist',
      url: 'https://codeforces.com',
    },
    {
      key: 'leetcode',
      name: 'LeetCode',
      icon: '🔥',
      placeholder: 'e.g., yourname',
      url: 'https://leetcode.com',
    },
    {
      key: 'codechef',
      name: 'CodeChef',
      icon: '👨‍💻',
      placeholder: 'e.g., yourhandle',
      url: 'https://codechef.com',
    },
  ];

  const handleChange = (platform, value) => {
    setHandles((prev) => ({ ...prev, [platform]: value }));
    if (errors[platform]) {
      setErrors((prev) => ({ ...prev, [platform]: null }));
    }
  };

  const handleLinkPlatform = async (platform) => {
    const handle = handles[platform];

    if (!handle.trim()) {
      setErrors((prev) => ({
        ...prev,
        [platform]: 'Handle is required',
      }));
      return;
    }

    setLoading((prev) => ({ ...prev, [platform]: true }));
    setErrors((prev) => ({ ...prev, [platform]: null }));

    try {
      await apiClient.post('/auth/link-platform', {
        platform,
        platformUsername: handle,
      });
      setStatus((prev) => ({ ...prev, [platform]: 'success' }));
      const newLinkedCount = linkedCount + 1;
      setLinkedCount(newLinkedCount);
      setHandles((prev) => ({ ...prev, [platform]: '' }));

      // If all 3 platforms are now linked, redirect to dashboard
      if (newLinkedCount === 3) {
        // Give user a moment to see success, then redirect
        setTimeout(() => {
          navigate('/dashboard');
        }, 1000);
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data?.errors?.[0] ||
        err.response?.data?.error ||
        `Failed to connect ${platform}`;
      setErrors((prev) => ({ ...prev, [platform]: errorMessage }));
      setStatus((prev) => ({ ...prev, [platform]: 'error' }));
    } finally {
      setLoading((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const allPlatformsLinked = linkedCount === 3;

  return (
    <div className="min-h-screen bg-[#0b0b0f] p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-grotesk font-bold text-[#f0f0f0] mb-2">
            Connect Your Accounts
          </h1>
          <p className="text-[#a0a0a0] max-w-lg mx-auto">
            Link all your Codeforces, LeetCode, and CodeChef accounts to start tracking your
            problems and progress. This is required to begin.
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 text-center">
          <div className="inline-block neo-card">
            <p className="text-[#a0a0a0]">
              Connected: <span className="text-[#4cc9f0] font-mono font-bold">{linkedCount}</span>/
              <span className="text-[#f0f0f0] font-mono">3</span>
            </p>
          </div>
        </div>

        {/* Platform Cards */}
        <div className="grid gap-6 mb-8">
          {platforms.map((platform) => (
            <div key={platform.key} className="neo-card">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{platform.icon}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-grotesk font-bold text-[#f0f0f0]">
                        {platform.name}
                      </h3>
                      <span className="text-red-400 font-bold">*</span>
                    </div>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#4cc9f0] hover:underline"
                    >
                      Visit {platform.name}
                    </a>
                  </div>
                </div>
                {status[platform.key] === 'success' && (
                  <div className="text-green-400 text-sm font-medium">✅ Connected</div>
                )}
                {status[platform.key] === 'error' && (
                  <div className="text-red-400 text-sm font-medium">❌ Failed</div>
                )}
              </div>

              {/* Input & Button */}
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder={platform.placeholder}
                  value={handles[platform.key]}
                  onChange={(e) => handleChange(platform.key, e.target.value)}
                  disabled={status[platform.key] === 'success'}
                  className={`neo-input flex-1 disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors[platform.key] ? 'border-red-500' : ''
                  }`}
                />
                <button
                  onClick={() => handleLinkPlatform(platform.key)}
                  disabled={loading[platform.key] || status[platform.key] === 'success'}
                  className={`neo-button-primary px-6 py-2 font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                    status[platform.key] === 'success' ? 'bg-green-600 border-green-500' : ''
                  }`}
                >
                  {loading[platform.key] ? '...' : status[platform.key] === 'success' ? '✓' : 'Connect'}
                </button>
              </div>

              {/* Error Message */}
              {errors[platform.key] && (
                <p className="text-red-400 text-sm mt-2">{errors[platform.key]}</p>
              )}
            </div>
          ))}
        </div>

        {/* Proceed Button - Disabled until all 3 are linked */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dashboard')}
            disabled={!allPlatformsLinked}
            className={`px-8 py-3 font-medium transition-all ${
              allPlatformsLinked
                ? 'neo-button-primary cursor-pointer'
                : 'neo-button opacity-50 cursor-not-allowed'
            }`}
          >
            {allPlatformsLinked ? 'Continue to Dashboard' : `Connect All Platforms to Continue (${linkedCount}/3)`}
          </button>
        </div>

        {/* Info Text */}
        <p className="text-center text-[#a0a0a0] text-sm mt-8 max-w-lg mx-auto">
          Your handles are used to sync your problems and stats from each platform. You can update
          them later from your profile settings.
        </p>
      </div>
    </div>
  );
};
