import axios from 'axios';
import { prisma } from '../config/prisma.js';

const CODEFORCES_API = 'https://codeforces.com/api';

export const fetchCodeForcesUserStats = async (handle) => {
    try {
        console.log(`Fetching CodeForces stats for ${handle}...`);
        const response = await axios.get(
            `${CODEFORCES_API}/user.info?handles=${handle}`,
            { timeout: 30000 }
        );
        
        if (response.data.status !== 'OK' || !response.data.result || response.data.result.length === 0) {
            throw new Error(`User ${handle} not found on CodeForces`);
        }

        const user = response.data.result[0];
        const rating = user.rating || null;
        const maxRating = user.maxRating || null;
        const rank = user.rank || null;
        const maxRank = user.maxRank || null;

        console.log(`CodeForces stats for ${handle}: rating=${rating}, rank=${rank}, maxRating=${maxRating}`);

        return {
            rating,
            maxRating,
            rank,
            maxRank
        };
    } catch (error) {
        console.error(`Error fetching CodeForces stats for ${handle}:`, error.message);
        return {
            rating: null,
            maxRating: null,
            rank: null,
            maxRank: null
        };
    }
};

export const fetchUserSubmissions = async (handle) => {
    try {
        console.log(`🔄 Fetching submissions for ${handle}...`);
        const response = await axios.get(
            `${CODEFORCES_API}/user.status?handle=${handle}&from=1&count=10000`,
            { timeout: 30000 }
        );
        
        if (response.data.status !== 'OK') {
            throw new Error(`User ${handle} not found on Codeforces`);
        }

        // Get only accepted submissions with full problem details
        const acceptedSubmissions = response.data.result
            .filter(s => s.verdict === 'OK')
            .map(s => ({
                contestId: s.problem.contestId,
                index: s.problem.index,
                name: s.problem.name,
                rating: s.problem.rating,
                tags: s.problem.tags || [],
                timestamp: s.creationTimeSeconds
            }));


        const uniqueSolved = new Map();
        for (const sub of acceptedSubmissions) {
            const key = `${sub.contestId}-${sub.index}`;
            if (!uniqueSolved.has(key) || sub.timestamp > uniqueSolved.get(key).timestamp) {
                uniqueSolved.set(key, sub);
            }
        }

        console.log(`✅ Found ${uniqueSolved.size} unique solved problems`);
        return Array.from(uniqueSolved.values());
    } catch (error) {
        console.error(`❌ Error fetching submissions for ${handle}:`, error.message);
        throw error;
    }
};


export const syncUserSolvedProblems = async (userId, codeforcesHandle) => {
    try {
        console.log(`Syncing problems for ${codeforcesHandle}...`);
        
        const userStats = await fetchCodeForcesUserStats(codeforcesHandle);
        const submissions = await fetchUserSubmissions(codeforcesHandle);
        let synced = 0;
        let created = 0;
        let failed = 0;

        for (const submission of submissions) {
            try {
                const platformProblemId = submission.contestId.toString() + submission.index;
                

                let problem = await prisma.problem.findUnique({
                    where: {
                        platform_platformProblemId: {
                            platform: 'cf',
                            platformProblemId
                        }
                    }
                });


                if (!problem) {
                    console.log(`📝 Creating new problem: ${platformProblemId}`);
                    
                    problem = await prisma.problem.create({
                        data: {
                            platform: 'cf',
                            platformProblemId,
                            title: submission.name,
                            difficulty: submission.rating ? `${submission.rating}` : null,
                            tags: JSON.stringify(submission.tags),
                            url: `https://codeforces.com/problemset/problem/${submission.contestId}/${submission.index}`
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

                synced++;
            } catch (error) {
                console.warn(
                    `⚠️ Failed to sync ${submission.contestId}${submission.index}:`,
                    error.message
                );
                failed++;
            }
        }

        console.log(
            `Sync complete for ${codeforcesHandle}: Synced ${synced}, Created ${created}, Failed ${failed}`
        );

        await prisma.platformStats.upsert({
            where: {
                userId_platform: {
                    userId,
                    platform: 'cf'
                }
            },
            update: {
                rating: userStats.rating,
                rawData: {
                    lastSync: new Date().toISOString(),
                    maxRating: userStats.maxRating,
                    rank: userStats.rank,
                    maxRank: userStats.maxRank,
                    lastSynced: synced,
                    lastCreated: created,
                    lastFailed: failed
                }
            },
            create: {
                userId,
                platform: 'cf',
                rating: userStats.rating,
                rawData: {
                    lastSync: new Date().toISOString(),
                    maxRating: userStats.maxRating,
                    rank: userStats.rank,
                    maxRank: userStats.maxRank,
                    lastSynced: synced,
                    lastCreated: created
                }
            }
        }).catch(() => {});

        return { synced, created, failed, total: submissions.length, rating: userStats.rating, maxRating: userStats.maxRating, rank: userStats.rank };
    } catch (error) {
        console.error(`❌ Error syncing user ${codeforcesHandle}:`, error.message);
        throw error;
    }
};
