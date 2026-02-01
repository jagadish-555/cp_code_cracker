import { prisma } from '../../config/prisma.js';

export const getAllProblems = async (req, res) => {
    try {
        const { platform, difficulty, page = 1, limit = 50 } = req.query;

        const where = {};
        if (platform) where.platform = platform;
        if (difficulty) where.difficulty = difficulty;

        const skip = (page - 1) * limit;

        const [problems, total] = await Promise.all([
            prisma.problem.findMany({
                where,
                skip,
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' }
            }),
            prisma.problem.count({ where })
        ]);

        res.status(200).json({
            problems,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getProblemById = async (req, res) => {
    try {
        const { id } = req.params;

        const problem = await prisma.problem.findUnique({
            where: { id }
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.status(200).json({ problem });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: error.message });
    }
};

export const searchProblems = async (req, res) => {
    try {
        const { query, platform } = req.query;

        if (!query) {
            return res.status(400).json({ error: 'Search query is required' });
        }

        const where = {
            title: {
                contains: query
            }
        };

        if (platform) {
            where.platform = platform;
        }

        const problems = await prisma.problem.findMany({
            where,
            take: 20,
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ problems, count: problems.length });
    } catch (error) {
        console.error('Error searching problems:', error);
        res.status(500).json({ error: error.message });
    }
};

export const syncProblems = async (req, res) => {
    try {
        res.status(200).json({
            message: 'Problems are synced on-demand when users sync their Codeforces handle. Use POST /api/submissions/sync/codeforces to add new problems.',
            info: 'Problems are automatically created when fetching user submissions'
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getProblemStats = async (req, res) => {
    try {
        const stats = await prisma.problem.groupBy({
            by: ['platform'],
            _count: {
                id: true
            }
        });

        const formattedStats = stats.map(stat => ({
            platform: stat.platform,
            count: stat._count.id
        }));

        const total = await prisma.problem.count();

        res.status(200).json({
            total,
            byPlatform: formattedStats
        });
    } catch (error) {
        console.error('Error fetching stats:', error);
        res.status(500).json({ error: error.message });
    }
};
