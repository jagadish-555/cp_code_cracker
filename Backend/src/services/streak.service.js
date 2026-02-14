import { prisma } from '../config/prisma.js';


const toDateOnly = (date) => {
    const d = new Date(date);
    return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
};


const daysDifference = (date1, date2) => {
    const d1 = toDateOnly(date1);
    const d2 = toDateOnly(date2);
    return Math.floor((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};


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


export const recalculateStreak = async (userId) => {
    try {
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


        const dates = [...new Set(activities.map(a => toDateOnly(a.date).getTime()))]
            .sort((a, b) => a - b)
            .map(t => new Date(t));


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

        }
        if (run > longest) longest = run;


        const today = toDateOnly(new Date());
        const lastDate = dates[dates.length - 1];
        const gapToday = daysDifference(lastDate, today);

        let currentStreak = 0;
        if (gapToday <= 1) {

            currentStreak = 1;

            for (let i = dates.length - 2; i >= 0; i--) {
                const diff = daysDifference(dates[i], dates[i + 1]);
                if (diff === 1) {
                    currentStreak += 1;
                } else {
                    break;
                }
            }
        }

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


export const updateStreakAndActivity = async (userId, solvedAt = new Date()) => {
    try {
        await upsertDailyActivity(userId, solvedAt);
        await recalculateStreak(userId);
    } catch (error) {
        console.error('Error updating streak/activity:', error.message);
        throw error;
    }
};


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


export const getUserStreakWithReset = async (userId) => {
    try {

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