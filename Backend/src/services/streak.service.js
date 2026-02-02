import { prisma } from '../config/prisma.js';

const utcDateOnly = (date) =>
  new Date(Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate()
  ));

export const updateStreakAndActivity = async (userId, solvedAt) => {
  if (!solvedAt || !(solvedAt instanceof Date) || isNaN(solvedAt)) {
    return;
  }

  const activityDate = utcDateOnly(solvedAt);
  const today = utcDateOnly(new Date());


  await prisma.dailyActivity.upsert({
    where: {
      userId_date: {
        userId,
        date: activityDate
      }
    },
    update: {
      activityCount: { increment: 1 }
    },
    create: {
      userId,
      date: activityDate,
      activityCount: 1
    }
  });


  if (activityDate.getTime() !== today.getTime()) {
    return; // 🚫 
  }

  const streak = await prisma.streak.findUnique({
    where: { userId }
  });

  const lastActive = streak?.lastActiveDate
    ? utcDateOnly(streak.lastActiveDate)
    : null;


  if (lastActive && lastActive.getTime() === today.getTime()) {
    return;
  }

  let currentStreak = 1;
  let longestStreak = streak?.longestStreak || 0;
  let maxStreak = streak?.maxStreak || 0;

  if (lastActive) {
    const diffDays =
      (today.getTime() - lastActive.getTime()) / 86400000;

    if (diffDays === 1) {
      currentStreak = (streak?.currentStreak || 0) + 1;
    } else {
      currentStreak = 1; 
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);
  maxStreak = Math.max(maxStreak, currentStreak);

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
};
