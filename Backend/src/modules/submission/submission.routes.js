import { Router } from 'express';
import {
    markProblemAsSolved,
    markProblemAsAttempted,
    getUserSolvedProblems,
    getUserAttemptedProblems,
    getUserStreak,
    getUserHeatmap,
    syncUserCodeforces,
    syncUserLeetCode,
    syncUserCodeChef,
    getUserProblemStats
} from './submission.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = Router();


router.use(verifyJWT);


router.post('/solved', markProblemAsSolved);
router.post('/attempted', markProblemAsAttempted);


router.get('/solved', getUserSolvedProblems);
router.get('/attempted', getUserAttemptedProblems);
router.get('/stats', getUserProblemStats);
router.get('/streak', getUserStreak);
router.get('/heatmap', getUserHeatmap);


router.post('/sync/codeforces', syncUserCodeforces);
router.post('/sync/leetcode', syncUserLeetCode);
router.post('/sync/codechef', syncUserCodeChef);

export default router;
