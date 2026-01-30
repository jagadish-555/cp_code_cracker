import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from './modules/auth/auth.routes.js';
import problemRoutes from './modules/problem/problem.routes.js';
import submissionRoutes from './modules/submission/submission.routes.js';
import friendRoutes from './modules/friend/friend.routes.js';
import contestRoutes from './modules/contest/contest.routes.js';

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())


app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/contests', contestRoutes);

app.get('/api/health', (req, res) => {
    res.status(200).json({ message: 'Server is running' });
});

app.use((err, req, res, next) => {
    console.error('Error:', err);
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
});
export default app;