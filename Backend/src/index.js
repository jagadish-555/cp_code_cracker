import 'dotenv/config.js';
import app from './app.js';
import { prisma } from './config/prisma.js';
import { startPlatformStatsSync } from './jobs/syncPlatformStats.js';
import { startContestSync } from './jobs/syncContests.js';

const PORT = process.env.PORT || 3001;


const startServer = async () =>{
    try{
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        startPlatformStatsSync();
        startContestSync();
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
}

startServer();
