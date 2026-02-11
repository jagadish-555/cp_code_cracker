import axios from 'axios';
import { prisma } from '../config/prisma.js';
import { bulkUpdateActivity } from './streak.service.js';

const LEETCODE_API = 'https://leetcode.com/graphql';

export const fetchLeetCodeUserStats = async (username) => {
    try {
        console.log(`Fetching LeetCode stats for ${username}...`);

        const query = `
            query getUserStats($username: String!) {
                matchedUser(username: $username) {
                    profile {
                        userSlug
                        realName
                        ranking
                    }
                    submitStatsGlobal {
                        acSubmissionNum {
                            difficulty
                            count
                            submissions
                        }
                    }
                }
            }
        `;

        const response = await axios.post(
            LEETCODE_API,
            {
                query,
                variables: { username: username }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Referer': 'https://leetcode.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 30000
            }
        );

        if (response.data.errors) {
            console.error('GraphQL Errors:', response.data.errors[0]?.message);
            throw new Error(response.data.errors[0]?.message);
        }

        const user = response.data.data?.matchedUser;
        if (!user) {
            throw new Error(`User ${username} not found on LeetCode`);
        }

        const ranking = user.profile?.ranking || null;
        const acStats = user.submitStatsGlobal?.acSubmissionNum || [];
        const totalSolved = acStats.reduce((sum, stat) => sum + stat.count, 0);

        console.log(`LeetCode stats for ${username}: ranking=${ranking}, totalSolved=${totalSolved}`);

        return {
            ranking,
            totalSolved,
            stats: acStats
        };
    } catch (error) {
        console.error(`Error fetching LeetCode stats for ${username}:`, error.message);
        return {
            ranking: null,
            totalSolved: null,
            stats: []
        };
    }
};

export const fetchLeetCodeUserProblems = async (username) => {
    try {
        console.log(`Fetching LeetCode problems for ${username}...`);

        const query = `
            query recentAcSubmissions($username: String!, $limit: Int!) {
                recentAcSubmissionList(username: $username, limit: $limit) {
                    id
                    title
                    titleSlug
                    timestamp
                }
            }
        `;

        const response = await axios.post(
            LEETCODE_API,
            {
                query,
                variables: { 
                    username: username,
                    limit: 100
                }
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Referer': 'https://leetcode.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                },
                timeout: 30000
            }
        );

        if (response.data.errors) {
            console.error('GraphQL Errors:', JSON.stringify(response.data.errors, null, 2));
            throw new Error(`LeetCode API error: ${response.data.errors[0]?.message}`);
        }

        const submissions = response.data.data?.recentAcSubmissionList || [];
        
        if (submissions.length === 0) {
            console.log(`No submissions found for ${username}`);
            return [];
        }

        console.log(`Found ${submissions.length} solved problems on LeetCode`);
        
        return submissions.map(sub => ({
            id: sub.id,
            title: sub.title,
            titleSlug: sub.titleSlug,
            timestamp: parseInt(sub.timestamp),
            url: `https://leetcode.com/problems/${sub.titleSlug}`
        }));
    } catch (error) {
        if (error.response) {
            console.error('API Response Error:', error.response.status, JSON.stringify(error.response.data, null, 2));
        }
        console.error(`Error fetching LeetCode problems for ${username}:`, error.message);
        throw error;
    }
};

export const syncUserSolvedLeetCode = async (userId, leetcodeUsername) => {
    try {
        console.log(`Syncing LeetCode problems for ${leetcodeUsername}...`);
        
        const userStats = await fetchLeetCodeUserStats(leetcodeUsername);
        const submissions = await fetchLeetCodeUserProblems(leetcodeUsername);
                
        if (submissions.length === 0) {
            const easySolved = userStats.stats?.find(s => s.difficulty === 'Easy')?.count || 0;
            const mediumSolved = userStats.stats?.find(s => s.difficulty === 'Medium')?.count || 0;
            const hardSolved = userStats.stats?.find(s => s.difficulty === 'Hard')?.count || 0;

            await prisma.platformStats.upsert({
                where: {
                    userId_platform: {
                        userId,
                        platform: 'lc'
                    }
                },
                update: {
                    rating: userStats.totalSolved,
                    solved: 0,
                    easySolved,
                    mediumSolved,
                    hardSolved,
                    rawData: {
                        lastSync: new Date().toISOString(),
                        ranking: userStats.ranking
                    }
                },
                create: {
                    userId,
                    platform: 'lc',
                    rating: userStats.totalSolved,
                    solved: 0,
                    easySolved,
                    mediumSolved,
                    hardSolved,
                    rawData: {
                        lastSync: new Date().toISOString(),
                        ranking: userStats.ranking
                    }
                }
            }).catch(() => {});

            return {
                synced: 0,
                created: 0,
                failed: 0,
                total: 0,
                ranking: userStats.ranking,
                totalSolved: userStats.totalSolved,
                message: 'No submissions found for this user'
            };
        }
        
        let synced = 0;
        let created = 0;
        let failed = 0;
        const solvedDates = [];

        for (const submission of submissions) {
            try {
                const platformProblemId = submission.id.toString();
                
                let problem = await prisma.problem.findUnique({
                    where: {
                        platform_platformProblemId: {
                            platform: 'lc',
                            platformProblemId
                        }
                    }
                });


                if (!problem) {
                    console.log(`Creating new problem: ${platformProblemId} - ${submission.title}`);
                    
                    problem = await prisma.problem.create({
                        data: {
                            platform: 'lc',
                            platformProblemId,
                            title: submission.title,
                            difficulty: submission.difficulty,
                            tags: JSON.stringify([submission.titleSlug]),
                            url: submission.url
                        }
                    });
                    
                    created++;
                }

                await prisma.userProblem.upsert({
                    where: {
                        userId_problemId: {
                            userId,
                            problemId: problem.id
                        }
                    },
                    update: {
                        status: 'solved',
                        solvedAt: new Date(submission.timestamp * 1000)
                    },
                    create: {
                        userId,
                        problemId: problem.id,
                        status: 'solved',
                        attempts: 1,
                        solvedAt: new Date(submission.timestamp * 1000)
                    }
                });

                solvedDates.push(new Date(submission.timestamp * 1000));

                synced++;
            } catch (error) {
                console.warn(
                    `Failed to sync ${submission.id} - ${submission.title}:`,
                    error.message
                );
                failed++;
            }
        }

        // Recalculate streak once after all submissions
        if (solvedDates.length > 0) {
            await bulkUpdateActivity(userId, solvedDates);
        }

        const easySolved = userStats.stats?.find(s => s.difficulty === 'Easy')?.count || 0;
        const mediumSolved = userStats.stats?.find(s => s.difficulty === 'Medium')?.count || 0;
        const hardSolved = userStats.stats?.find(s => s.difficulty === 'Hard')?.count || 0;

        await prisma.platformStats.upsert({
            where: {
                userId_platform: {
                    userId,
                    platform: 'lc'
                }
            },
            update: {
                rating: userStats.totalSolved,
                solved: synced,
                easySolved,
                mediumSolved,
                hardSolved,
                rawData: {
                    lastSync: new Date().toISOString(),
                    ranking: userStats.ranking,
                    lastSynced: synced,
                    lastCreated: created,
                    lastFailed: failed
                }
            },
            create: {
                userId,
                platform: 'lc',
                rating: userStats.totalSolved,
                solved: synced,
                easySolved,
                mediumSolved,
                hardSolved,
                rawData: {
                    lastSync: new Date().toISOString(),
                    ranking: userStats.ranking,
                    lastSynced: synced,
                    lastCreated: created
                }
            }
        }).catch(() => {});

        console.log(`Sync complete for ${leetcodeUsername}: Synced ${synced}, Created ${created}, Failed ${failed}`);

        return { synced, created, failed, total: submissions.length, ranking: userStats.ranking, totalSolved: userStats.totalSolved };
    } catch (error) {
        console.error(`Error syncing user ${leetcodeUsername}:`, error.message);
        throw error;
    }
};
