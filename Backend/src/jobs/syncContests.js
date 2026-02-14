import { fetchAndSyncContests } from "../services/contest.service.js";

const SYNC_INTERVAL_HOURS =
  parseInt(process.env.CONTEST_SYNC_INTERVAL_HOURS) || 6;


async function runContestSync() {
  try {
    console.log(`[ContestSync] Starting contest sync...`);
    const result = await fetchAndSyncContests();

    if (result.success) {
      console.log(
        `[ContestSync] Successfully synced ${result.count}/${result.total} contests`
      );
    } else {
      console.error(`[ContestSync] Sync failed: ${result.error}`);
    }
  } catch (error) {
    console.error("[ContestSync] Error during sync:", error.message);
  }
}


function startContestSync() {
  console.log(
    `[ContestSync] Initializing background job (interval: ${SYNC_INTERVAL_HOURS}h)`
  );

  // Delay initial sync to avoid hammering APIs on every dev restart
  const initialDelay = process.env.NODE_ENV === 'production' ? 0 : 60000;
  setTimeout(() => {
    runContestSync();
  }, initialDelay);


  const intervalMs = SYNC_INTERVAL_HOURS * 60 * 60 * 1000;
  setInterval(runContestSync, intervalMs);

  console.log("[ContestSync] Background job started");
}

export {
  runContestSync,
  startContestSync,
};
