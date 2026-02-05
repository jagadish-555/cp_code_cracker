import { prisma } from '../config/prisma.js';

const toDateOnly = (date) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
};

export const updateStreakAndActivity = async (userId, solvedAt) => {
    try {
        const activityDate = toDateOnly(solvedAt || new Date());
        const today = toDateOnly(new Date());

        const existingActivity = await prisma.dailyActivity.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: activityDate
                }
            }
        });

        if (!existingActivity) {
            if (activityDate.getTime() === today.getTime()) {
                const streak = await prisma.streak.findUnique({
                    where: { userId }
                });

                const lastActiveDate = streak?.lastActiveDate ? toDateOnly(streak.lastActiveDate) : null;
                let currentStreak = streak?.currentStreak || 0;
                let longestStreak = streak?.longestStreak || 0;
                let maxStreak = streak?.maxStreak || 0;

                if (!lastActiveDate) {
                    currentStreak = 1;
                } else {
                    const diffDays = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        currentStreak += 1;
                    } else if (diffDays > 1) {
                        currentStreak = 1;
                    }
                }

                if (currentStreak > maxStreak) {
                    maxStreak = currentStreak;
                }
                
                if (currentStreak > longestStreak) {
                    longestStreak = currentStreak;
                }

                await prisma.streak.upsert({
                    where: { userId },
                    update: {
                        currentStreak,
                        longestStreak,
                        maxStreak,
                        lastActiveDate: today
                    },
                    create: {
                        userId,
                        currentStreak,
                        longestStreak,
                        maxStreak,
                        lastActiveDate: today
                    }
                });
            }

            await prisma.dailyActivity.create({
                data: {
                    userId,
                    date: activityDate,
                    activityCount: 1
                }
            });
        } else {
            await prisma.dailyActivity.update({
                where: {
                    userId_date: {
                        userId,
                        date: activityDate
                    }
                },
                data: {
                    activityCount: {
                        increment: 1
                    }
                }
            });
        }
    } catch (error) {
        console.error('Error updating streak/activity:', error.message);
    }
};