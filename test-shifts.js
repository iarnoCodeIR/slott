const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findMany({ include: { shifts: true } });
    console.log(JSON.stringify(staff, null, 2));
}

main().finally(() => prisma.$disconnect());
