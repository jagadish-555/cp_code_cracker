import { z } from 'zod';

export const signupSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    username: z.string().min(3, 'Username must be at least 3 characters'),
});

export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string(),
});

export const linkPlatformSchema = z.object({
    platform: z.enum(['leetcode', 'codeforces', 'codechef']),
    platformUsername: z.string().min(1, 'Platform username is required'),
});

export const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            const validated = schema.parse(req.body);
            req.validated = validated;
            next();
        } catch (error) {
            const errors = error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
            res.status(400).json({ error: errors });
        }
    }};