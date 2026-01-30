import app from './app.js';
import {prisma} from '.config/prisma.js';

const PORT = process.env.PORT || 5000;


const startServer = async () =>{
    try{
        await prisma.$connect();
        console.log("Connected to the database successfully.");

        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
}

startServer();
