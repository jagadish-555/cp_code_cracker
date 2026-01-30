import { Router } from 'express';
import {
    sendFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest,
    getPendingRequests,
    getFriends,
    removeFriend,
    compareStats
} from './friend.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.post('/request', sendFriendRequest);
router.post('/accept', acceptFriendRequest);
router.post('/reject', rejectFriendRequest);
router.post('/remove', removeFriend);
router.get('/pending', getPendingRequests);
router.get('/list', getFriends);
router.get('/compare/:friendId', compareStats);

export default router;
