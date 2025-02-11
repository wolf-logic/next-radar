import { PrismaClient } from "@prisma/client";

let prisma;

// @ts-ignore
if (!global.prisma) global.prisma = new PrismaClient();

// @ts-ignore
prisma = global.prisma;

export { prisma };
export default prisma;
