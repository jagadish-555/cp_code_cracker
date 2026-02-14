import { prisma } from '../config/prisma.js';
import { syncUserSolvedProblems } from '../services/codeforces.service.js';
import { syncUserSolvedLeetCode } from '../services/leetcode.service.js';
import { syncUserSolvedCodeChef } from '../services/codechef.service.js';

const SYNC_JOB_INTERVAL_HOURS = Number(process.env.SYNC_JOB_INTERVAL_HOURS || 24);

const runPlatformSync = async () => {
	try {
		const accounts = await prisma.platformAccount.findMany();

		for (const account of accounts) {
			try {
				if (account.platform === 'cf') {
					await syncUserSolvedProblems(account.userId, account.handle);
				} else if (account.platform === 'lc') {
					await syncUserSolvedLeetCode(account.userId, account.handle);
				} else if (account.platform === 'cc') {
					await syncUserSolvedCodeChef(account.userId, account.handle);
				}
			} catch (error) {
				console.error(`Platform sync failed for ${account.platform}:${account.handle}`, error.message);
			}
		}
	} catch (error) {
		console.error('Platform sync job failed:', error.message);
	}
};

export const startPlatformStatsSync = () => {
	const intervalMs = SYNC_JOB_INTERVAL_HOURS * 60 * 60 * 1000;

	// Delay initial sync to avoid hammering APIs on every dev restart
	const initialDelay = process.env.NODE_ENV === 'production' ? 0 : 60000;
	setTimeout(() => {
		runPlatformSync();
	}, initialDelay);

	setInterval(() => {
		runPlatformSync();
	}, intervalMs);
};
