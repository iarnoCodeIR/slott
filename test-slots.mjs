import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function getAvailableSlots(staffId, serviceId, dateStr) {
    if (!staffId || staffId === "staff-1") {
        return ["09:00", "09:30", "10:00", "11:30", "14:00", "15:30", "16:00", "17:00"];
    }

    try {
        const [staff, service] = await Promise.all([
            prisma.staff.findUnique({ where: { id: staffId } }),
            prisma.service.findUnique({ where: { id: serviceId } })
        ]);

        if (!staff || !service) return [];

        const durationMin = service.durationMin;

        // Date parsée en locale depuis le YYYY-MM-DD
        const [year, month, day] = dateStr.split("-").map(Number);
        const targetDate = new Date(year, month - 1, day, 12, 0, 0);

        const startOfDay = new Date(targetDate);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(targetDate);
        endOfDay.setHours(23, 59, 59, 999);

        // Récupérer les RDV déjà existants
        const appointments = await prisma.appointment.findMany({
            where: {
                staffId: staffId,
                slotTime: {
                    gte: startOfDay,
                    lte: endOfDay
                },
                status: "CONFIRMED"
            },
            include: { service: true }
        });

        const bookedRanges = appointments.map(app => {
            const start = app.slotTime.getHours() * 60 + app.slotTime.getMinutes();
            const duration = app.service?.durationMin || 30;
            return { start, end: start + duration };
        });

        const dayOfWeek = targetDate.getDay().toString(); // 0 (Dimanche) à 6 (Samedi)

        let hoursData = {};
        if (staff.workingHours) {
            try {
                hoursData = typeof staff.workingHours === 'string' ? JSON.parse(staff.workingHours) : staff.workingHours;
            } catch (e) { }
        }

        let activeScheduleForDay = null;
        let isDayActive = false;

        const exception = (hoursData.exceptions || []).find(e => e.date === dateStr);

        if (exception) {
            if (exception.type === "conge") {
                return []; // En congé = 0 créneau
            } else if (exception.type === "custom") {
                activeScheduleForDay = { active: true, slots: exception.slots };
                isDayActive = true;
            }
        } else {
            // Lecture classique selon le mode (Fixe ou Alterné)
            if (hoursData.type === "alternating") {
                const d = new Date(targetDate.getTime());
                d.setHours(0, 0, 0, 0);
                d.setDate(d.getDate() + 4 - (d.getDay() || 7));
                const yearStart = new Date(d.getFullYear(), 0, 1);
                const weekNo = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

                const isEven = weekNo % 2 === 0;
                const weekSchedule = isEven ? hoursData.scheduleEven : hoursData.scheduleOdd;
                activeScheduleForDay = weekSchedule?.[dayOfWeek];
            } else if (hoursData.type === "fixed") {
                activeScheduleForDay = hoursData.schedule?.[dayOfWeek];
            } else {
                activeScheduleForDay = hoursData[dayOfWeek];
            }

            isDayActive = activeScheduleForDay?.active === true;
        }

        // Backward compatibility handling for older DB format without "slots" array
        let dailySlots = activeScheduleForDay?.slots;
        if (!dailySlots && activeScheduleForDay?.start && activeScheduleForDay?.end) {
            dailySlots = [{ start: activeScheduleForDay.start, end: activeScheduleForDay.end }];
        }

        if (!isDayActive || !dailySlots || dailySlots.length === 0) {
            console.log("NOT ACTIVE OR NO SLOTS: ", { isDayActive, dailySlots });
            return [];
        }

        const availableSlots = [];
        const intervalMin = 30; // On vérifie un créneau toutes les 30 minutes

        console.log("--- DEBUG SLOTT TIME ENGINE ---");
        console.log("DATE: ", targetDate);
        console.log("DAY OF WEEK: ", dayOfWeek);
        console.log("SLOTS TO PROCESS: ", JSON.stringify(dailySlots));
        console.log("BOOKED: ", JSON.stringify(bookedRanges));

        // L'Algorithme Intelligent (Time Engine)
        for (const slot of dailySlots) {
            if (!slot.start || !slot.end) continue;

            const [startH, startM] = slot.start.split(":").map(Number);
            const [endH, endM] = slot.end.split(":").map(Number);

            const periodStartMin = startH * 60 + startM;
            const periodEndMin = endH * 60 + endM;

            let currentMin = periodStartMin;

            while (currentMin + durationMin <= periodEndMin) {
                // Vérifier si ce créneau (currentMin -> currentMin + durationMax) intersecte un des bookedRanges
                const overlaps = bookedRanges.some(booked => {
                    return currentMin < booked.end && (currentMin + durationMin) > booked.start;
                });

                if (!overlaps) {
                    const h = Math.floor(currentMin / 60);
                    const m = currentMin % 60;
                    availableSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                }

                currentMin += intervalMin;
            }
        }

        // Nettoyer les slots dans le passé si c'est aujourd'hui
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        const isToday = dateStr === todayStr;
        const currentHourMin = now.getHours() * 60 + now.getMinutes();

        return availableSlots.filter(slot => {
            if (!isToday) return true;
            const [h, m] = slot.split(':').map(Number);
            return (h * 60 + m) > currentHourMin;
        });

    } catch (e) {
        console.error("Time Engine Error: ", e);
        return [];
    }
}

async function main() {
    const staff = await prisma.staff.findFirst();
    const service = await prisma.service.findFirst();
    if (staff && service) {
        console.log(`Staff: ${staff.id}, Service: ${service.id}`);
        const dateStr = "2026-03-06";
        console.log("Testing date:", dateStr);
        const slots = await getAvailableSlots(staff.id, service.id, dateStr);
        console.log("AVAILABLE SLOTS:", slots);
    } else {
        console.log("No staff or service found in db");
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
