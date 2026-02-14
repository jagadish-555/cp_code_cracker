import 'dotenv/config.js';
import app from './app.js';
import { prisma } from './config/prisma.js';
import { startPlatformStatsSync } from './jobs/syncPlatformStats.js';
import { startContestSync } from './jobs/syncContests.js';

const PORT = process.env.PORT || 3001;


const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        console.error(`FATAL: Missing required environment variable: ${envVar}`);
        process.exit(1);
    }
}

const startServer = async () =>{
    try{
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        const server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        startPlatformStatsSync();
        startContestSync();


        const shutdown = async (signal) => {
            console.log(`\n${signal} received. Shutting down gracefully...`);
            server.close(async () => {
                await prisma.$disconnect();
                console.log('Database connection closed.');
                process.exit(0);
            });

            setTimeout(() => process.exit(1), 10000);
        };

        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    } catch (error) {
        console.error("Failed to start the server:", error);
        process.exit(1);
    }
}

process.on('unhandledRejection', (reason) => {
    console.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

startServer();
