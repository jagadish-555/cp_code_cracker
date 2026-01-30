import { Router } from 'express';
import {
    signup,
    login,
    logout,
    linkPlatformAccount,
    getCurrentUser
} from './auth.controller.js';
import { verifyJWT } from '../../middlewares/auth.middleware.js';
import { validateRequest, signupSchema, loginSchema, linkPlatformSchema } from './auth.validator.js';

const router = Router();


router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', validateRequest(loginSchema), login);
router.post('/logout', logout);


router.post('/link-platform', verifyJWT, validateRequest(linkPlatformSchema), linkPlatformAccount);
router.get('/me', verifyJWT, getCurrentUser);

export default router;