import axios from 'axios';
import { load } from 'cheerio';
import { prisma } from '../config/prisma.js';

const CODECHEF_BASE_URL = 'https://www.codechef.com';
const CODECHEF_SCRAPING_ENABLED = (process.env.CODECHEF_SCRAPING_ENABLED || '').toLowerCase() === 'true';
const CODECHEF_COOLDOWN_HOURS = Number(process.env.CODECHEF_SCRAPE_COOLDOWN_HOURS || 12);
const CODECHEF_MAX_PAGES = Number(process.env.CODECHEF_SCRAPE_MAX_PAGES || 100);

const getCooldownMs = () => {
    const hours = Number.isFinite(CODECHEF_COOLDOWN_HOURS) ? CODECHEF_COOLDOWN_HOURS : 12;
    return hours * 60 * 60 * 1000;
};

const normalizeRawData = (rawData) => {
    if (!rawData) return {};
    if (typeof rawData === 'string') {
        try {
            return JSON.parse(rawData);
        } catch {
            return {};
        }
    }
    return rawData;
};

const updatePlatformSyncMeta = async (userId, data) => {
    await prisma.platformStats.upsert({
        where: {
            userId_platform: {
                userId,
                platform: 'cc'
            }
        },
        update: {
            rawData: data
        },
        create: {
            userId,
            platform: 'cc',
            rawData: data
        }
    });
};

export const fetchCodeChefUserStats = async (username) => {
    try {
        const url = `https://www.codechef.com/users/${username}`;
        console.log(`Fetching CodeChef stats for ${username} from ${url}...`);

        const response = await axios.get(url, {
            timeout: 10000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
        });

        const $ = load(response.data);

        const ratingText = $('div.rating-number').text().trim();
        const rating = parseInt(ratingText) || null;

        let globalRank = null;
        let countryRank = null;

        $('a[href*="/ratings/"]').each((i, el) => {
            const text = $(el).text().trim();
            const parentText = $(el).parent().text().trim();
            const num = parseInt(text.replace(/,/g, ''));
            
            if (!isNaN(num)) {
                if (parentText.includes('Global')) {
                    globalRank = num;
                } else if (parentText.includes('Country')) {
                    countryRank = num;
                }
            }
        });

        console.log(`CodeChef stats for ${username}: rating=${rating}, globalRank=${globalRank}, countryRank=${countryRank}`);

        return {
            rating,
            globalRank,
            countryRank
        };
    } catch (error) {
        console.error(`Error fetching CodeChef stats for ${username}:`, error.message);
        return {
            rating: null,
            globalRank: null,
            countryRank: null
        };
    }
};

export const fetchCodeChefSubmissions = async (username) => {
    const problems = new Map();
    let page = 0;
    let hasMoreData = true;

    console.log(`Fetching all submissions for user: ${username}`);

    while (hasMoreData) {
        try {
            const url = `https://www.codechef.com/recent/user?page=${page}&user_handle=${username}`;
            console.log(`Fetching page ${page}...`);

            const response = await axios.get(url, {
                timeout: 10000,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'application/json',
                },
            });

            const data = response.data;

            if (!data || !data.content || data.content.trim() === '') {
                console.log(`No more data at page ${page}`);
                hasMoreData = false;
                break;
            }

            const $ = load(data.content);
            
            let foundSubmissions = 0;
            
            $('table tbody tr').each((_, row) => {
                const timeCell = $(row).find('td').eq(0);
                const problemCell = $(row).find('td').eq(1);
                const resultCell = $(row).find('td').eq(2);
                const langCell = $(row).find('td').eq(3);
                const problemLink = problemCell.find('a');
                
                const timeTitle = timeCell.attr('title') || '';
                const resultStatus = resultCell.text().trim();
                const language = langCell.text().trim();
                
                if (problemLink.length > 0) {
                    const href = problemLink.attr('href');
                    const problemName = problemLink.text().trim();
                    
                    if (href && problemName) {
                        const contestMatch = href.match(/\/([A-Z0-9]+)\/problems\/([A-Z0-9_]+)/);
                        
                        if (contestMatch) {
                            const contestCode = contestMatch[1];
                            const problemCode = contestMatch[2];
                            const fullUrl = `https://www.codechef.com/${contestCode}/problems/${problemCode}`;
                            
                            if (!problems.has(problemCode)) {
                                problems.set(problemCode, {
                                    name: problemName,
                                    link: fullUrl,
                                    contestCode: contestCode,
                                    problemCode: problemCode,
                                    submissionTime: timeTitle,
                                    result: resultStatus,
                                    language: language,
                                });
                                foundSubmissions++;
                            }
                        }
                    }
                }
            });

            console.log(`Found ${foundSubmissions} new problems on page ${page}`);

            if (foundSubmissions === 0) {
                hasMoreData = false;
            } else {
                page++;
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            if (page > CODECHEF_MAX_PAGES) {
                console.log(`Reached maximum page limit (${CODECHEF_MAX_PAGES})`);
                hasMoreData = false;
            }
        } catch (error) {
            console.error(`Error fetching page ${page}:`, error.message);
            hasMoreData = false;
        }
    }

    const result = Array.from(problems.values());
    console.log(`Total unique problems found: ${result.length}`);
    return result;
};

export const syncUserSolvedCodeChef = async (userId, username) => {
    if (!CODECHEF_SCRAPING_ENABLED) {
        return {
            synced: 0,
            created: 0,
            failed: 0,
            total: 0,
            message: 'CodeChef scraping is disabled'
        };
    }

    try {
        console.log(`Syncing CodeChef for ${username}...`);

        const platformStats = await prisma.platformStats.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: 'cc'
                }
            }
        });

        const rawData = normalizeRawData(platformStats?.rawData);
        const lastSync = rawData.lastSync ? new Date(rawData.lastSync) : null;
        const now = new Date();
        const cooldownMs = getCooldownMs();

        if (lastSync && !Number.isNaN(lastSync.getTime())) {
            const elapsed = now.getTime() - lastSync.getTime();
            if (elapsed < cooldownMs) {
                const remainingMs = cooldownMs - elapsed;
                const remainingMinutes = Math.ceil(remainingMs / 60000);
                console.log(`Cooldown active for ${username}. Remaining: ${remainingMinutes} minutes`);
                return {
                    synced: 0,
                    created: 0,
                    failed: 0,
                    total: 0,
                    message: `Cooldown active. Try again in ${remainingMinutes} minutes`
                };
            }
        }

        const submissions = await fetchCodeChefSubmissions(username);
        const userStats = await fetchCodeChefUserStats(username);

        if (!submissions.length) {
            await updatePlatformSyncMeta(userId, {
                ...rawData,
                lastAttempt: now.toISOString(),
                lastSync: now.toISOString(),
                lastResult: 'empty',
                globalRank: userStats.globalRank,
                countryRank: userStats.countryRank
            });

            await prisma.platformStats.update({
                where: {
                    userId_platform: {
                        userId,
                        platform: 'cc'
                    }
                },
                data: {
                    rating: userStats.rating
                }
            }).catch(() => {});

            console.log(`No submissions found for ${username}`);
            return {
                synced: 0,
                created: 0,
                failed: 0,
                total: 0,
                rating: userStats.rating,
                globalRank: userStats.globalRank,
                countryRank: userStats.countryRank,
                message: 'No submissions found'
            };
        }

        let synced = 0;
        let created = 0;
        let failed = 0;

        for (const submission of submissions) {
            try {
                const platformProblemId = `${submission.contestCode}:${submission.problemCode}`;

                let problem = await prisma.problem.findUnique({
                    where: {
                        platform_platformProblemId: {
                            platform: 'cc',
                            platformProblemId
                        }
                    }
                });

                if (!problem) {
                    problem = await prisma.problem.create({
                        data: {
                            platform: 'cc',
                            platformProblemId,
                            title: submission.name,
                            difficulty: null,
                            tags: JSON.stringify([]),
                            url: submission.link
                        }
                    });

                    created++;
                }

                const parsedDate = submission.submissionTime ? new Date(submission.submissionTime) : null;
                const solvedAt = parsedDate && !Number.isNaN(parsedDate.getTime()) ? parsedDate : null;

                await prisma.userProblem.upsert({
                    where: {
                        userId_problemId: {
                            userId,
                            problemId: problem.id
                        }
                    },
                    update: {
                        status: 'solved',
                        solvedAt: solvedAt ?? undefined
                    },
                    create: {
                        userId,
                        problemId: problem.id,
                        status: 'solved',
                        attempts: 1,
                        solvedAt
                    }
                });

                synced++;
            } catch (error) {
                console.warn(`Failed to sync problem:`, error.message);
                failed++;
            }
        }

        await updatePlatformSyncMeta(userId, {
            ...rawData,
            lastAttempt: now.toISOString(),
            lastSync: now.toISOString(),
            lastResult: 'success',
            lastTotal: submissions.length,
            lastSynced: synced,
            lastCreated: created,
            lastFailed: failed,
            globalRank: userStats.globalRank,
            countryRank: userStats.countryRank
        });

        await prisma.platformStats.update({
            where: {
                userId_platform: {
                    userId,
                    platform: 'cc'
                }
            },
            data: {
                rating: userStats.rating
            }
        }).catch(() => {});

        console.log(`Sync complete for ${username}: ${synced} synced, ${created} created, ${failed} failed`);
        return { synced, created, failed, total: submissions.length, rating: userStats.rating, globalRank: userStats.globalRank, countryRank: userStats.countryRank };
    } catch (error) {
        console.error(`Error syncing CodeChef:`, error.message);
        return {
            synced: 0,
            created: 0,
            failed: 0,
            total: 0,
            message: error.message || 'CodeChef sync failed'
        };
    }
};