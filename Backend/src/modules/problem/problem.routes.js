import { Router } from 'express';
import {
    getAllProblems,
    getProblemById,
    searchProblems,
    syncProblems,
    getProblemStats
} from './problem.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

// Public routes
router.get('/', getAllProblems);
router.get('/search', searchProblems);
router.get('/stats', getProblemStats);
router.get('/:id', getProblemById);

// Admin routes (protected)
router.post('/sync', verifyJWT, syncProblems);

export default router;
