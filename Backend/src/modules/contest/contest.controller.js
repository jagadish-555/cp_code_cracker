import { prisma } from "../../config/prisma.js";
import {
  fetchAndSyncContests,
  getUpcomingContests,
  getContestsByResource,
} from "../../services/contest.service.js";
import asyncHandler from "../../utils/asyncHandler.js";
import { ApiResponse } from "../../utils/ApiResponse.js";
import { ApiError } from "../../utils/ApiError.js";

const getContests = asyncHandler(async (req, res) => {
  const { daysAhead = 30, resource } = req.query;
  const days = Math.min(parseInt(daysAhead) || 30, 90);

  let contests;
  if (resource) {
    contests = await getContestsByResource(resource, days);
  } else {
    contests = await getUpcomingContests(new Date(), days);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      contests,
      count: contests.length,
    })
  );
});

const syncContests = asyncHandler(async (req, res) => {
  const result = await fetchAndSyncContests();

  if (!result.success) {
    throw new ApiError(500, `Failed to sync contests: ${result.error}`);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      message: `Synced ${result.count} contests`,
      count: result.count,
      total: result.total,
    })
  );
});

const addContestReminder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { contestId, reminderMinutesBefore = 60 } = req.body;

  if (!contestId) {
    throw new ApiError(400, "contestId is required");
  }

  const contest = await prisma.contest.findUnique({
    where: { id: contestId },
  });

  if (!contest) {
    throw new ApiError(404, "Contest not found");
  }

  const reminderTime = new Date(
    contest.startTime.getTime() - reminderMinutesBefore * 60 * 1000
  );

  const reminder = await prisma.contestReminder.upsert({
    where: {
      userId_contestId: {
        userId,
        contestId,
      },
    },
    create: {
      userId,
      contestId,
      reminderTime,
    },
    update: {
      reminderTime,
      notified: false,
    },
    include: {
      contest: true,
    },
  });

  return res.status(200).json(
    new ApiResponse(200, {
      reminder: {
        id: reminder.id,
        contest: reminder.contest.event,
        resource: reminder.contest.resource,
        startTime: reminder.contest.startTime,
        reminderTime: reminder.reminderTime,
      },
    })
  );
});

const getUserReminders = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { upcoming = true } = req.query;

  let where = {
    userId,
  };

  if (upcoming === "true" || upcoming === true) {
    where.notified = false;
    where.contest = {
      startTime: {
        gte: new Date(),
      },
    };
  }

  const reminders = await prisma.contestReminder.findMany({
    where,
    include: {
      contest: true,
    },
    orderBy: {
      reminderTime: "asc",
    },
  });

  return res.status(200).json(
    new ApiResponse(200, {
      reminders: reminders.map((r) => ({
        id: r.id,
        contestId: r.contestId,
        contest: r.contest.event,
        resource: r.contest.resource,
        startTime: r.contest.startTime,
        reminderTime: r.reminderTime,
        href: r.contest.href,
        calendarLink: generateCalendarLink(r.contest),
        notified: r.notified,
      })),
      count: reminders.length,
    })
  );
});

const removeContestReminder = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reminderId } = req.params;

  const reminder = await prisma.contestReminder.findUnique({
    where: { id: reminderId },
  });

  if (!reminder || reminder.userId !== userId) {
    throw new ApiError(404, "Reminder not found");
  }

  await prisma.contestReminder.delete({
    where: { id: reminderId },
  });

  return res.status(200).json(
    new ApiResponse(200, {
      message: "Reminder removed",
    })
  );
});

function generateCalendarLink(contest) {
  const title = encodeURIComponent(contest.event);
  const description = encodeURIComponent(
    `${contest.host} Contest\nProblems: ${contest.nProblems || "N/A"}`
  );
  const location = encodeURIComponent(contest.href);

  const startDate = contest.startTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const endDate = contest.endTime.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const dates = `${startDate}/${endDate}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&details=${description}&location=${location}&dates=${dates}`;
}

export {
  getContests,
  syncContests,
  addContestReminder,
  getUserReminders,
  removeContestReminder,
};
