import { PrismaClient } from '@prisma/client';
import { getAvailableSlots } from './app/book/[salon]/actions.js';

const prisma = new PrismaClient();

async function main() {
    const staff = await prisma.staff.findFirst();
    const service = await prisma.service.findFirst();
    if (staff && service) {
        console.log(`Staff: ${staff.id}, Service: ${service.id}`);
        // Let's test for today or tomorrow
        const dateStr = "2026-03-06";
        const slots = await getAvailableSlots(staff.id, service.id, dateStr);
        console.log("AVAILABLE SLOTS:", slots);
    } else {
        console.log("No staff or service found in db");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
