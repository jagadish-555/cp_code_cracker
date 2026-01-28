import {prismaClient} from "@prisma/client";

const prisma = new prismaClient();

async function main() {
    const users = await prisma.user.findMany();
    console.log(users);
}