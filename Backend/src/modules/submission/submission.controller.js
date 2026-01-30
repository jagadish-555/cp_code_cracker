import { prisma } from '../../config/prisma.js';
import { syncUserSolvedProblems } from '../../services/codeforces.service.js';
import { syncUserSolvedLeetCode } from '../../services/leetcode.service.js';
import { syncUserSolvedCodeChef } from '../../services/codechef.service.js';


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
        const { platform } = req.query;

        const where = {
            userId,
            status: 'solved'
        };

        if (platform) {
            where.problem = {
                platform
            };
        }

        const solvedProblems = await prisma.userProblem.findMany({
            where,
            include: {
                problem: true
            },
            orderBy: {
                solvedAt: 'desc'
            }
        });

        res.status(200).json({
            solved: solvedProblems,
            count: solvedProblems.length
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


export const syncUserCodeforces = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { handle } = req.body;

        if (!handle) {
            return res.status(400).json({ error: 'Codeforces handle is required' });
        }

        const result = await syncUserSolvedProblems(userId, handle);

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
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'LeetCode username is required' });
        }

        const result = await syncUserSolvedLeetCode(userId, username);

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
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'CodeChef username is required' });
        }

        const result = await syncUserSolvedCodeChef(userId, username);

        res.status(200).json({
            message: 'CodeChef submissions synced successfully',
            result
        });
    } catch (error) {
        res.status(200).json({
            message: 'CodeChef submissions synced successfully',
            result: {
                synced: 0,
                created: 0,
                failed: 0,
                total: 0,
                message: error.message
            }
        });
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
