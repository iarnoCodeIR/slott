import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findFirst();
    console.log("STAFF ID:", staff?.id);
    console.log("WORKING HOURS:", JSON.stringify(staff?.workingHours, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
