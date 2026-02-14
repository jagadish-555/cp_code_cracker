import { prisma } from '../../config/prisma.js';

export const sendFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendEmail } = req.body;

        if (!friendEmail) {
            return res.status(400).json({ error: 'Friend email is required' });
        }

        const friend = await prisma.user.findUnique({
            where: { email: friendEmail }
        });

        if (!friend) {
            return res.status(404).json({ error: 'No user found with that email' });
        }

        if (friend.id === userId) {
            return res.status(400).json({ error: 'Cannot send friend request to yourself' });
        }

        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, addresseeId: friend.id },
                    { requesterId: friend.id, addresseeId: userId }
                ],
                status: { in: ['pending', 'accepted'] }
            }
        });

        if (existingFriendship) {
            return res.status(400).json({ error: 'Friend request already exists or already friends' });
        }

        // Delete any previously rejected request so a new one can be created
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { requesterId: userId, addresseeId: friend.id },
                    { requesterId: friend.id, addresseeId: userId }
                ],
                status: 'rejected'
            }
        });

        const friendship = await prisma.friendship.create({
            data: {
                requesterId: userId,
                addresseeId: friend.id,
                status: 'pending'
            },
            include: {
                addressee: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        res.status(201).json({
            message: 'Friend request sent',
            friendship
        });
    } catch (error) {
        console.error('Error sending friend request:', error);
        res.status(500).json({ error: error.message });
    }
};

export const acceptFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendshipId } = req.body;

        if (!friendshipId) {
            return res.status(400).json({ error: 'Friendship ID is required' });
        }

        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId }
        });

        if (!friendship) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        if (friendship.addresseeId !== userId) {
            return res.status(403).json({ error: 'Not authorized to accept this request' });
        }

        if (friendship.status !== 'pending') {
            return res.status(400).json({ error: 'Friend request already processed' });
        }

        const updatedFriendship = await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'accepted' },
            include: {
                requester: {
                    select: {
                        id: true,
                        email: true,
                        username: true
                    }
                }
            }
        });

        res.status(200).json({
            message: 'Friend request accepted',
            friendship: updatedFriendship
        });
    } catch (error) {
        console.error('Error accepting friend request:', error);
        res.status(500).json({ error: error.message });
    }
};

export const rejectFriendRequest = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendshipId } = req.body;

        if (!friendshipId) {
            return res.status(400).json({ error: 'Friendship ID is required' });
        }

        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId }
        });

        if (!friendship) {
            return res.status(404).json({ error: 'Friend request not found' });
        }

        if (friendship.addresseeId !== userId) {
            return res.status(403).json({ error: 'Not authorized to reject this request' });
        }

        await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: 'rejected' }
        });

        res.status(200).json({
            message: 'Friend request rejected'
        });
    } catch (error) {
        console.error('Error rejecting friend request:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getPendingRequests = async (req, res) => {
    try {
        const userId = req.user.userId;

        const requests = await prisma.friendship.findMany({
            where: {
                addresseeId: userId,
                status: 'pending'
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        createdAt: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.status(200).json({
            requests,
            count: requests.length
        });
    } catch (error) {
        console.error('Error fetching pending requests:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getFriends = async (req, res) => {
    try {
        const userId = req.user.userId;

        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: 'accepted' },
                    { addresseeId: userId, status: 'accepted' }
                ]
            },
            include: {
                requester: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        createdAt: true
                    }
                },
                addressee: {
                    select: {
                        id: true,
                        email: true,
                        username: true,
                        createdAt: true
                    }
                }
            }
        });

        const friends = friendships.map(f => {
            const friend = f.requesterId === userId ? f.addressee : f.requester;
            return {
                ...friend,
                friendshipId: f.id,
                friendsSince: f.createdAt
            };
        });

        res.status(200).json({
            friends,
            count: friends.length
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: error.message });
    }
};

export const removeFriend = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendshipId } = req.body;

        if (!friendshipId) {
            return res.status(400).json({ error: 'Friendship ID is required' });
        }

        const friendship = await prisma.friendship.findUnique({
            where: { id: friendshipId }
        });

        if (!friendship) {
            return res.status(404).json({ error: 'Friendship not found' });
        }

        if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
            return res.status(403).json({ error: 'Not authorized to remove this friendship' });
        }

        await prisma.friendship.delete({
            where: { id: friendshipId }
        });

        res.status(200).json({
            message: 'Friend removed successfully'
        });
    } catch (error) {
        console.error('Error removing friend:', error);
        res.status(500).json({ error: error.message });
    }
};

export const compareStats = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { friendId } = req.params;

        if (!friendId) {
            return res.status(400).json({ error: 'Friend ID is required' });
        }

        const friendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, addresseeId: friendId, status: 'accepted' },
                    { requesterId: friendId, addresseeId: userId, status: 'accepted' }
                ]
            }
        });

        if (!friendship) {
            return res.status(403).json({ error: 'Not friends with this user' });
        }

        const [userStats, friendStats] = await Promise.all([
            getCompleteStats(userId),
            getCompleteStats(friendId)
        ]);

        res.status(200).json({
            user: userStats,
            friend: friendStats
        });
    } catch (error) {
        console.error('Error comparing stats:', error);
        res.status(500).json({ error: error.message });
    }
};

const getCompleteStats = async (userId) => {
    const [user, totalSolved, totalAttempted, platformStats, streak, byPlatform] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true
            }
        }),
        prisma.userProblem.count({
            where: { userId, status: 'solved' }
        }),
        prisma.userProblem.count({
            where: { userId, status: 'attempted' }
        }),
        prisma.platformStats.findMany({
            where: { userId }
        }),
        prisma.streak.findUnique({
            where: { userId }
        }),
        prisma.userProblem.groupBy({
            by: ['status'],
            where: {
                userId,
                problem: {
                    platform: {
                        in: ['cf', 'lc', 'cc']
                    }
                }
            },
            _count: {
                id: true
            }
        })
    ]);

    const solvedByPlatform = await Promise.all(
        ['cf', 'lc', 'cc'].map(async (platform) => {
            const count = await prisma.userProblem.count({
                where: {
                    userId,
                    status: 'solved',
                    problem: { platform }
                }
            });
            return { platform, count };
        })
    );

    return {
        user,
        totalSolved,
        totalAttempted,
        streak: {
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0
        },
        platformStats: platformStats.map(p => ({
            platform: p.platform,
            rating: p.rating,
            rawData: p.rawData
        })),
        solvedByPlatform
    };
};
