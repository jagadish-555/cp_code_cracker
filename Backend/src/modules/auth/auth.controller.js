import bcrypt from 'bcryptjs';
import { prisma } from '../../config/prisma.js';
// ↑ Added semicolon

import { generateToken } from '../../middlewares/auth.middleware.js';

// Helper function to generate correct platform URLs
const getPlatformUrl = (platform, username) => {
    const urls = {
        leetcode: `https://leetcode.com/u/${username}/`,
        codeforces: `https://codeforces.com/profile/${username}`,
        codechef: `https://www.codechef.com/users/${username}`,
        atcoder: `https://atcoder.jp/users/${username}`
    };
    return urls[platform] || `https://${platform}.com/${username}`;
};

export const signup = async (req, res) => {
    try {
        const { email, password, username } = req.validated;

        const existingUser = await prisma.user.findUnique({ where: { email } });

        if (existingUser) {
            return res.status(400).json({ error: 'Email already registered' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                email,
                username,
                password: hashedPassword
            }
        });

        const token = generateToken(newUser.id);

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });


        res.status(201).json({
            message: 'User registered successfully',
            user: { id: newUser.id, email: newUser.email, username: newUser.username },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.validated;

        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) {

            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {

            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = generateToken(user.id);

        res.cookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.status(200).json({
            message: 'Login successful',
            user: { id: user.id, email: user.email, username: user.username },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    res.clearCookie('accessToken');
    res.status(200).json({ message: 'Logout successful' });
};

export const linkPlatformAccount = async (req, res) => {
    try {
        const { platform, platformUsername } = req.validated;
        const userId = req.user.userId;

        // Map frontend platform names to enum values
        const platformMap = {
            'codeforces': 'cf',
            'leetcode': 'lc',
            'codechef': 'cc'
        };

        const mappedPlatform = platformMap[platform];

        const existingLink = await prisma.platformAccount.findUnique({
            where: {
                userId_platform: {
                    userId,
                    platform: mappedPlatform
                }
            }
        });

        if (existingLink) {
            return res.status(400).json({ error: `${platform} account already linked` });
        }

        const platformAccount = await prisma.platformAccount.create({
            data: {
                userId,
                platform: mappedPlatform,
                handle: platformUsername
            }
        });

        res.status(200).json({
            message: `${platform} account linked successfully`,
            platformAccount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                platformAccounts: true,
                streak: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};