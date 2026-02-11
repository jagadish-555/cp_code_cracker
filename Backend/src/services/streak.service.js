import { prisma } from '../config/prisma.js';

/**
 * Normalize date to UTC midnight (start of day)
 */
const toDateOnly = (date) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};

/**
 * Calculate days difference between two dates
 */
const daysDifference = (date1, date2) => {
    const d1 = toDateOnly(date1);
    const d2 = toDateOnly(date2);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Update user's daily activity entry (heatmap data).
 * Does NOT touch the streak — call recalculateStreak() after a batch sync,
 * or after a single solve via updateStreakAndActivity().
 */
const upsertDailyActivity = async (userId, solvedAt) => {
    const activityDate = toDateOnly(solvedAt);
    await prisma.dailyActivity.upsert({
        where: {
            userId_date: {
                userId,
                date: activityDate
            }
        },
        create: {
            userId,
            date: activityDate,
            activityCount: 1
        },
        update: {
            activityCount: {
                increment: 1
            }
        }
    });
};

/**
 * Recalculate streak from the DailyActivity table (source of truth).
 * Walks backwards from today through consecutive active days.
 * Also computes the longest streak across all activity.
 */
export const recalculateStreak = async (userId) => {
    try {
        // Fetch all activity days sorted ascending
        const activities = await prisma.dailyActivity.findMany({
            where: { userId },
            orderBy: { date: 'asc' },
            select: { date: true }
        });

        if (activities.length === 0) {
            await prisma.streak.upsert({
                where: { userId },
                update: { currentStreak: 0, longestStreak: 0, maxStreak: 0, lastActiveDate: null },
                create: { userId, currentStreak: 0, longestStreak: 0, maxStreak: 0, lastActiveDate: null }
            });
            return;
        }

        // Deduplicate to unique dates and normalise
        const dates = [...new Set(activities.map(a => toDateOnly(a.date).getTime()))]
            .sort((a, b) => a - b)
            .map(t => new Date(t));

        // Walk forward to find longest streak ever
        let longest = 1;
        let run = 1;
        for (let i = 1; i < dates.length; i++) {
            const diff = daysDifference(dates[i - 1], dates[i]);
            if (diff === 1) {
                run += 1;
                if (run > longest) longest = run;
            } else if (diff > 1) {
                run = 1;
            }
            // diff === 0 shouldn't happen after dedup, but ignore if it does
        }
        if (run > longest) longest = run;

        // Walk backwards from today for current streak
        const today = toDateOnly(new Date());
        const lastDate = dates[dates.length - 1];
        const gapToday = daysDifference(lastDate, today);

        let currentStreak = 0;
        if (gapToday <= 1) {
            // Last activity was today or yesterday — streak is still alive
            currentStreak = 1;
            // Walk backwards through the sorted dates
            for (let i = dates.length - 2; i >= 0; i--) {
                const diff = daysDifference(dates[i], dates[i + 1]);
                if (diff === 1) {
                    currentStreak += 1;
                } else {
                    break;
                }
            }
        }
        // else: gap > 1 day → streak is already 0

        // Fetch existing to preserve maxStreak if it was higher
        const existing = await prisma.streak.findUnique({ where: { userId } });
        const prevMax = existing?.maxStreak || 0;
        const maxStreak = Math.max(prevMax, longest);

        await prisma.streak.upsert({
            where: { userId },
            update: {
                currentStreak,
                longestStreak: longest,
                maxStreak,
                lastActiveDate: lastDate
            },
            create: {
                userId,
                currentStreak,
                longestStreak: longest,
                maxStreak,
                lastActiveDate: lastDate
            }
        });
    } catch (error) {
        console.error('Error recalculating streak:', error.message);
        throw error;
    }
};

/**
 * Update user's streak and daily activity for a SINGLE solve (e.g. manual mark-solved).
 * For bulk syncs, prefer calling upsertDailyActivity per submission then recalculateStreak once.
 */
export const updateStreakAndActivity = async (userId, solvedAt = new Date()) => {
    try {
        await upsertDailyActivity(userId, solvedAt);
        await recalculateStreak(userId);
    } catch (error) {
        console.error('Error updating streak/activity:', error.message);
        throw error;
    }
};

/**
 * Bulk-insert daily activity entries and recalculate streak once.
 * Use this during platform sync to avoid N recalculations.
 * @param {string} userId
 * @param {Date[]} solvedDates - array of solve timestamps
 */
export const bulkUpdateActivity = async (userId, solvedDates) => {
    try {
        for (const d of solvedDates) {
            await upsertDailyActivity(userId, d);
        }
        await recalculateStreak(userId);
    } catch (error) {
        console.error('Error in bulk activity update:', error.message);
        throw error;
    }
};

/**
 * Get user's current streak — recalculates to ensure accuracy.
 * @param {string} userId - User ID
 * @returns {Object} Streak data
 */
export const getUserStreakWithReset = async (userId) => {
    try {
        // Recalculate first so currentStreak auto-resets if inactive
        await recalculateStreak(userId);

        const streak = await prisma.streak.findUnique({
            where: { userId }
        });

        return {
            currentStreak: streak?.currentStreak || 0,
            longestStreak: streak?.longestStreak || 0,
            maxStreak: streak?.maxStreak || 0,
            lastActiveDate: streak?.lastActiveDate || null
        };
    } catch (error) {
        console.error('Error fetching streak:', error.message);
        throw error;
    }
};