import { prisma } from '../../config/prisma.js';
import { syncUserSolvedProblems } from '../../services/codeforces.service.js';
import { syncUserSolvedLeetCode } from '../../services/leetcode.service.js';
import { syncUserSolvedCodeChef } from '../../services/codechef.service.js';
import { updateStreakAndActivity, getUserStreakWithReset } from '../../services/streak.service.js';


export const markProblemAsSolved = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { problemId } = req.body;

        if (!problemId) {
            return res.status(400).json({ error: 'Problem ID is required' });
        }


        const problem = await prisma.problem.findUnique({
            where: { id: problemId }
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }


        const userProblem = await prisma.userProblem.upsert({
            where: {
                userId_problemId: {
                    userId,
                    problemId
                }
            },
            create: {
                userId,
                problemId,
                status: 'solved',
                solvedAt: new Date()
            },
            update: {
                status: 'solved',
                solvedAt: new Date()
            }
        });

        await updateStreakAndActivity(userId, new Date());

        res.status(200).json({
            message: 'Problem marked as solved',
            userProblem
        });
    } catch (error) {
        console.error('Error marking problem as solved:', error);
        res.status(500).json({ error: error.message });
    }
};


export const markProblemAsAttempted = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { problemId } = req.body;

        if (!problemId) {
            return res.status(400).json({ error: 'Problem ID is required' });
        }


        const problem = await prisma.problem.findUnique({
            where: { id: problemId }
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }


        const userProblem = await prisma.userProblem.upsert({
            where: {
                userId_problemId: {
                    userId,
                    problemId
                }
            },
            create: {
                userId,
                problemId,
                status: 'attempted',
                attempts: 1
            },
            update: {
                attempts: {
                    increment: 1
                }
            }
        });

        res.status(200).json({
            message: 'Problem marked as attempted',
            userProblem
        });
    } catch (error) {
        console.error('Error marking problem as attempted:', error);
        res.status(500).json({ error: error.message });
    }
};


export const getUserSolvedProblems = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { platform, page = 1, limit = 10 } = req.query;

        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
        const skip = (pageNum - 1) * limitNum;

        const where = {
            userId,
            status: 'solved'
        };

        if (platform) {
            where.problem = {
                platform
            };
        }

        const totalCount = await prisma.userProblem.count({ where });
        const totalPages = Math.ceil(totalCount / limitNum);

        const solvedProblems = await prisma.userProblem.findMany({
            where,
            include: {
                problem: true
            },
            orderBy: {
                solvedAt: 'desc'
            },
            skip,
            take: limitNum
        });

        res.status(200).json({
            problems: solvedProblems.map(up => ({
                ...up.problem,
                solvedAt: up.solvedAt,
                status: up.status
            })),
            count: solvedProblems.length,
            totalCount,
            page: pageNum,
            limit: limitNum,
            totalPages
        });
    } catch (error) {
        console.error('Error fetching solved problems:', error);
        res.status(500).json({ error: error.message });
    }
};


export const getUserAttemptedProblems = async (req, res) => {
    try {
        const userId = req.user.userId;

        const attemptedProblems = await prisma.userProblem.findMany({
            where: {
                userId,
                status: 'attempted'
            },
            include: {
                problem: true
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        res.status(200).json({
            attempted: attemptedProblems,
            count: attemptedProblems.length
        });
    } catch (error) {
        console.error('Error fetching attempted problems:', error);
        res.status(500).json({ error: error.message });
    }
};


export const getUserStreak = async (req, res) => {
    try {
        const userId = req.user.userId;

        const streakData = await getUserStreakWithReset(userId);

        res.status(200).json(streakData);
    } catch (error) {
        console.error('Error fetching streak:', error);
        res.status(500).json({ error: error.message });
    }
};


export const getUserHeatmap = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { createdAt: true }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const endDate = new Date();
        const startDate = new Date(user.createdAt);
        startDate.setHours(0, 0, 0, 0);

        const activity = await prisma.dailyActivity.findMany({
            where: {
                userId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: {
                date: 'asc'
            }
        });

        const heatmap = activity.map(item => ({
            date: item.date.toISOString().slice(0, 10),
            activityCount: item.activityCount
        }));

        res.status(200).json({
            startDate: startDate.toISOString().slice(0, 10),
            endDate: endDate.toISOString().slice(0, 10),
            heatmap
        });
    } catch (error) {
        console.error('Error fetching heatmap:', error);
        res.status(500).json({ error: error.message });
    }
};


export const syncUserCodeforces = async (req, res) => {
    try {
        const userId = req.user.userId;

        const platformAccount = await prisma.platformAccount.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'cf'
                }
            }
        });

        if (!platformAccount) {
            return res.status(400).json({ error: 'Codeforces account not linked' });
        }

        const result = await syncUserSolvedProblems(userId, platformAccount.handle);

        res.status(200).json({
            message: 'Codeforces submissions synced successfully',
            result
        });
    } catch (error) {
        console.error('Error syncing Codeforces submissions:', error);
        res.status(500).json({ error: error.message });
    }
};


export const syncUserLeetCode = async (req, res) => {
    try {
        const userId = req.user.userId;

        const platformAccount = await prisma.platformAccount.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'lc'
                }
            }
        });

        if (!platformAccount) {
            return res.status(400).json({ error: 'LeetCode account not linked' });
        }

        const result = await syncUserSolvedLeetCode(userId, platformAccount.handle);

        res.status(200).json({
            message: 'LeetCode submissions synced successfully',
            result
        });
    } catch (error) {
        console.error('Error syncing LeetCode submissions:', error);
        res.status(500).json({ error: error.message });
    }
};


export const syncUserCodeChef = async (req, res) => {
    try {
        const userId = req.user.userId;

        const platformAccount = await prisma.platformAccount.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'cc'
                }
            }
        });

        if (!platformAccount) {
            return res.status(400).json({ error: 'CodeChef account not linked' });
        }

        const result = await syncUserSolvedCodeChef(userId, platformAccount.handle);

        res.status(200).json({
            message: 'CodeChef submissions synced successfully',
            result
        });
    } catch (error) {
        console.error('Error syncing CodeChef submissions:', error);
        res.status(500).json({ error: error.message });
    }
};


export const getUserProblemStats = async (req, res) => {
    try {
        const userId = req.user.userId;

        const [totalSolved, totalAttempted, byPlatform] = await Promise.all([
            prisma.userProblem.count({
                where: { userId, status: 'solved' }
            }),
            prisma.userProblem.count({
                where: { userId, status: 'attempted' }
            }),
            prisma.userProblem.groupBy({
                by: ['status'],
                where: { userId },
                _count: {
                    id: true
                }
            })
        ]);


        const solvedProblems = await prisma.userProblem.findMany({
            where: { userId, status: 'solved' },
            include: {
                problem: {
                    select: {
                        difficulty: true,
                        platform: true
                    }
                }
            }
        });

        const difficultyBreakdown = solvedProblems.reduce((acc, up) => {
            const diff = up.problem.difficulty || 'unknown';
            acc[diff] = (acc[diff] || 0) + 1;
            return acc;
        }, {});

        const platformBreakdown = solvedProblems.reduce((acc, up) => {
            const platform = up.problem.platform;
            acc[platform] = (acc[platform] || 0) + 1;
            return acc;
        }, {});

        res.status(200).json({
            totalSolved,
            totalAttempted,
            difficultyBreakdown,
            platformBreakdown
        });
    } catch (error) {
        console.error('Error fetching user stats:', error);
        res.status(500).json({ error: error.message });
    }
};
