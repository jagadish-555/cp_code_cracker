import axios from "axios";
import { prisma } from "../config/prisma.js";

const CLIST_API_URL = "https://clist.by/api/v4/contest";
const CLIST_TOKEN = process.env.CLIST_API_TOKEN;
const CLIST_USERNAME = process.env.CLIST_USERNAME;

async function fetchAndSyncContests() {
  try {
    if (!CLIST_TOKEN) {
      throw new Error("CLIST_API_TOKEN not configured");
    }


    const now = new Date();
    const sixtyDaysFromNow = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);

    const params = {
      limit: 200,
      offset: 0,
      start__gte: now.toISOString().split("T")[0],
      start__lte: sixtyDaysFromNow.toISOString().split("T")[0],
      resource__in: "codeforces.com,leetcode.com,codechef.com",
    };

    console.log("[ContestSync] Fetching from clist.by with params:", params);

    const response = await axios.get(CLIST_API_URL, {
      params,
      headers: {
        Authorization: `ApiKey ${CLIST_USERNAME}:${CLIST_TOKEN}`,
      },
      timeout: 15000,
    });

    if (!response.data || !response.data.objects) {
      throw new Error("Invalid response from clist.by API");
    }

    const contests = response.data.objects;
    let upsertedCount = 0;


    for (const contest of contests) {
      try {
        await prisma.contest.upsert({
          where: { clistId: contest.id.toString() },
          create: {
            clistId: contest.id.toString(),
            resource: contest.resource || "unknown",
            host: contest.host || "unknown",
            event: contest.event || "Contest",
            startTime: new Date(contest.start),
            endTime: new Date(contest.end),
            duration: contest.duration || null,
            href: contest.href || "",
            nProblems: contest.n_problems || null,
            parsedAt: new Date(),
          },
          update: {
            resource: contest.resource || "unknown",
            host: contest.host || "unknown",
            event: contest.event || "Contest",
            startTime: new Date(contest.start),
            endTime: new Date(contest.end),
            duration: contest.duration || null,
            href: contest.href || "",
            nProblems: contest.n_problems || null,
            parsedAt: new Date(),
          },
        });
        upsertedCount++;
      } catch (err) {
        console.error(
          `Error upserting contest ${contest.id}: ${err.message}`
        );
      }
    }

    return {
      success: true,
      count: upsertedCount,
      total: contests.length,
    };
  } catch (error) {
    console.error("Error fetching contests from clist.by:", error.message);
    return {
      success: false,
      error: error.message,
    };
  }
}

async function getUpcomingContests(startDate = new Date(), daysAhead = 30) {
  try {
    const endDate = new Date(
      startDate.getTime() + daysAhead * 24 * 60 * 60 * 1000
    );

    return await prisma.contest.findMany({
      where: {
        startTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });
  } catch (error) {
    console.error("Error fetching upcoming contests:", error.message);
    return [];
  }
}

async function getContestsByResource(resource, daysAhead = 30) {
  try {
    const now = new Date();
    const endDate = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return await prisma.contest.findMany({
      where: {
        resource: resource,
        startTime: {
          gte: now,
          lte: endDate,
        },
      },
      orderBy: {
        startTime: "asc",
      },
    });
  } catch (error) {
    console.error(
      `Error fetching ${resource} contests:`,
      error.message
    );
    return [];
  }
}

export {
  fetchAndSyncContests,
  getUpcomingContests,
  getContestsByResource,
};
