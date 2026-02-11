import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { StatusStrip } from '../components/StatusStrip';
import { PlatformStats } from '../components/PlatformStats';
import { RecentProblemsTable } from '../components/RecentProblemsTable';
import { ContestsTable } from '../components/ContestsTable';
import { ActivityHeatmap } from '../components/ActivityHeatmap';
import { useAuth } from '../context/AuthContext';
import { apiClient } from '../api/client';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [platformStats, setPlatformStats] = useState(null);
  const [contests, setContests] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);

  const [problems, setProblems] = useState([]);
  const [problemsPage, setProblemsPage] = useState(1);
  const [problemsTotalPages, setProblemsTotalPages] = useState(1);
  const [problemsLoading, setProblemsLoading] = useState(false);

  const [loading, setLoading] = useState(true);
  const [contestsLoading, setContestsLoading] = useState(true);
  const [heatmapLoading, setHeatmapLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const userRes = await apiClient.get('/auth/me');
        const userData = userRes.data.user;
        
        const totalSolved = userData.userProblems?.filter(p => p.status === 'solved')?.length || 0;
        const currentStreak = userData.streak?.currentStreak || 0;
        const maxStreak = userData.streak?.maxStreak || userData.streak?.longestStreak || 0;

        setStats({
          totalSolved,
          currentStreak,
          maxStreak,
        });

        const formattedPlatformStats = {};
        
        userData.platformAccounts?.forEach((acc) => {
          const platformStat = userData.platformStats?.find(ps => ps.platform === acc.platform);
          
          if (acc.platform === 'cf') {
            formattedPlatformStats.codeforces = {
              solved: platformStat?.solved || 0,
              currentRating: platformStat?.rating || 0,
              maxRating: platformStat?.maxRating || 0,
              title: platformStat?.title || '—',
            };
          } else if (acc.platform === 'lc') {
            formattedPlatformStats.leetcode = {
              rating: platformStat?.rating || '—',
              totalSolved: platformStat?.solved || 0,
              easySolved: platformStat?.easySolved || 0,
              mediumSolved: platformStat?.mediumSolved || 0,
              hardSolved: platformStat?.hardSolved || 0,
            };
          } else if (acc.platform === 'cc') {
            formattedPlatformStats.codechef = {
              rating: platformStat?.rating || '—',
              maxRating: platformStat?.maxRating || '—',
              totalSolved: platformStat?.solved || 0,
              stars: platformStat?.stars || 0,
            };
          }
        });

        setPlatformStats(formattedPlatformStats);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchContests = async () => {
      try {
        setContestsLoading(true);
        const res = await apiClient.get('/contests');
        setContests(res.data.contests?.slice(0, 5) || []);
      } catch (err) {
        console.error('Failed to load contests:', err);
      } finally {
        setContestsLoading(false);
      }
    };

    const fetchHeatmap = async () => {
      try {
        setHeatmapLoading(true);
        const res = await apiClient.get('/submissions/heatmap');
        setHeatmapData(res.data.heatmap || []);
      } catch (err) {
        console.error('Failed to load heatmap:', err);
      } finally {
        setHeatmapLoading(false);
      }
    };

    Promise.all([
      fetchDashboardData(),
      fetchContests(),
      fetchHeatmap(),
    ]);
  }, []);

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setProblemsLoading(true);
        const res = await apiClient.get('/submissions/solved', {
          params: {
            page: problemsPage,
            limit: 10,
          },
        });
        setProblems(res.data.problems || []);
        setProblemsTotalPages(res.data.totalPages || 1);
      } catch (err) {
        console.error('Failed to load problems:', err);
      } finally {
        setProblemsLoading(false);
      }
    };

    fetchProblems();
  }, [problemsPage]);

  const handleProblemPageChange = (newPage) => {
    if (newPage >= 1 && newPage <= problemsTotalPages) {
      setProblemsPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Welcome back,</p>
        <h1 className="text-4xl md:text-5xl font-bold text-white font-mono">Dashboard</h1>
      </div>

      {!loading && stats && <StatusStrip stats={stats} />}

      {!loading && platformStats && <PlatformStats stats={platformStats} />}

      <RecentProblemsTable
        problems={problems}
        loading={problemsLoading}
        onPageChange={handleProblemPageChange}
        page={problemsPage}
        totalPages={problemsTotalPages}
      />

      <ContestsTable contests={contests} loading={contestsLoading} />

      <ActivityHeatmap data={heatmapData} loading={heatmapLoading} />
    </DashboardLayout>
  );
};
