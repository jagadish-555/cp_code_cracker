import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiClient, authApi } from '../api/client';
import { FormError } from '../components/FormError';
import { codechefLogo, codeforcesLogo, leetcodeLogo } from '../assets';
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
      icon: <img src={codeforcesLogo} alt="Codeforces" className="w-6 h-6" />,
      placeholder: 'e.g., tourist',
      url: 'https://codeforces.com',
    },
    {
      key: 'leetcode',
      name: 'LeetCode',
      icon: <img src={leetcodeLogo} alt="LeetCode" className="w-6 h-6" />,
      placeholder: 'e.g., yourname',
      url: 'https://leetcode.com',
    },
    {
      key: 'codechef',
      name: 'CodeChef',
      icon: <img src={codechefLogo} alt="CodeChef" className="w-6 h-6" />,
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

      if (newLinkedCount === 3) {
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
    <div className="min-h-screen bg-[#0a0a0a] p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-12 text-center">
          <p className="text-[10px] text-white/40 uppercase tracking-wider mb-3">Setup</p>
          <h1 className="text-4xl md:text-5xl font-bold text-white font-mono mb-4">
            Connect Platforms
          </h1>
          <p className="text-white/50 max-w-lg mx-auto text-sm">
            Link all your Codeforces, LeetCode, and CodeChef accounts to start tracking your
            problems and progress.
          </p>
        </div>

        <div className="mb-10 flex justify-center">
          <div className="border border-neutral-700/30 rounded bg-white/5 backdrop-blur-sm px-8 py-4">
            <p className="text-white/50 text-sm">
              Connected:{' '}
              <span className="text-yellow-300 font-mono font-bold text-xl">{linkedCount}</span>
              <span className="text-white/30 font-mono text-lg"> / 3</span>
            </p>
          </div>
        </div>

        <div className="space-y-5 mb-10">
          {platforms.map((platform) => (
            <div 
              key={platform.key} 
              className="relative border border-neutral-700/30 rounded-lg bg-white/5 backdrop-blur-sm hover:border-neutral-600/50 transition-all duration-200"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    <span className="text-3xl">{platform.icon}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-mono font-bold text-white">
                          {platform.name}
                        </h3>
                        <span className="text-red-400 font-bold text-lg">*</span>
                      </div>
                      <a
                        href={platform.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#4cc9f0] hover:underline transition-colors"
                      >
                        Visit {platform.name}
                      </a>
                    </div>
                  </div>
                  
                  {status[platform.key] === 'success' && (
                    <div className="absolute top-0 right-0 w-16 h-full bg-emerald-500/10 border-l border-emerald-500/30 rounded-r-lg flex items-center justify-center">
                      <span className="text-emerald-400 text-2xl">✓</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder={platform.placeholder}
                    value={handles[platform.key]}
                    onChange={(e) => handleChange(platform.key, e.target.value)}
                    disabled={status[platform.key] === 'success'}
                    className={`neo-input flex-1 disabled:opacity-50 disabled:cursor-not-allowed transition-all ${
                      errors[platform.key] ? 'border-red-500 focus:border-red-500' : ''
                    }`}
                  />
                  <button
                    onClick={() => handleLinkPlatform(platform.key)}
                    disabled={loading[platform.key] || status[platform.key] === 'success'}
                    className="px-6 py-2.5 font-medium font-mono whitespace-nowrap rounded border transition-all duration-200 bg-white/5 border-neutral-700/30 text-white hover:border-neutral-600/50 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading[platform.key] ? (
                      <span className="inline-block animate-spin">⟳</span>
                    ) : (
                      'Connect'
                    )}
                  </button>
                </div>

                {errors[platform.key] && (
                  <p className="text-red-400 text-xs mt-3">{errors[platform.key]}</p>
                )}
              </div>
              {status[platform.key] === 'success' && (
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-400 rounded-l-lg" />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <button
            onClick={() => navigate('/dashboard')}
            disabled={!allPlatformsLinked}
            className={`px-10 py-4 font-medium font-mono rounded border transition-all duration-200 ${
              allPlatformsLinked
                ? 'bg-yellow-300 border-yellow-300 text-black hover:bg-yellow-400 hover:border-yellow-400'
                : 'border-neutral-700/40 bg-white/5 text-white/40 cursor-not-allowed'
            }`}
          >
            {allPlatformsLinked 
              ? 'Continue to Dashboard →' 
              : `Connect All Platforms to Continue (${linkedCount}/3)`
            }
          </button>
        </div>
      </div>
    </div>
  );
};
