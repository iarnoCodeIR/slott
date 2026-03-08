"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";

export async function getSalonData(slug: string) {
    try {
        const salon = await prisma.salon.findUnique({
            where: { slug },
            include: {
                services: true,
                staff: true,
            },
        });
        return salon;
    } catch (error) {
        console.warn("Database not connected or error fetching salon:", error);
        return null;
    }
}

export async function getAvailableSlots(staffId: string, serviceIds: string[], dateStr: string) {
    noStore();

    console.log(`[getAvailableSlots] staffId=${staffId}, serviceIds=${serviceIds.join(',')}, dateStr=${dateStr}`);

    if (!staffId || staffId === "staff-1") {
        return ["09:00", "09:30", "10:00", "11:30", "14:00", "15:30", "16:00", "17:00"];
    }

    try {
        const [staff, servicesList] = await Promise.all([
            prisma.staff.findUnique({ where: { id: staffId } }),
            prisma.service.findMany({ where: { id: { in: serviceIds } } })
        ]);

        if (!staff || servicesList.length === 0) return [];

        // Total duration = sum of all selected services + their buffers
        const durationMin = servicesList.reduce((sum: number, s: any) => sum + s.durationMin, 0);
        const bufferMin = servicesList.reduce((sum: number, s: any) => sum + (s.bufferTimeMin || 0), 0);

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
                OR: [
                    { status: "CONFIRMED" },
                    {
                        status: "PENDING",
                        createdAt: { gte: new Date(Date.now() - 30 * 60000) } // Bloqué 30 min max
                    }
                ]
            },
            include: { service: true }
        });

        const bookedRanges = appointments.map((app: any) => {
            const start = app.slotTime.getHours() * 60 + app.slotTime.getMinutes();
            const duration = app.service?.durationMin || 30;
            const buffer = app.service?.bufferTimeMin || 0;
            return { start, end: start + duration + buffer };
        }).sort((a: any, b: any) => a.start - b.start);

        const dayOfWeek = targetDate.getDay().toString(); // 0 (Dimanche) à 6 (Samedi)

        let hoursData: any = {};
        if (staff.workingHours) {
            try {
                hoursData = typeof staff.workingHours === 'string' ? JSON.parse(staff.workingHours) : staff.workingHours;
            } catch (e) { }
        }

        let activeScheduleForDay = null;
        let isDayActive = false;

        const exception = (hoursData.exceptions || []).find((e: any) => e.date === dateStr);

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
            return [];
        }

        const availableSlots: string[] = [];
        const slotStep = 30; // Génère des créneaux espacés de 30 min (sauf après un rdv)

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
                // Trouver si ce créneau intersecte un des bookedRanges
                let overlappingRange = null;
                for (const booked of bookedRanges) {
                    if (currentMin < booked.end && (currentMin + durationMin + bufferMin) > booked.start) {
                        overlappingRange = booked;
                        break;
                    }
                }

                if (overlappingRange) {
                    // S'il y a collision, on reprend exactement à la fin du rdv qui bloque
                    currentMin = Math.max(currentMin + 5, overlappingRange.end);
                } else {
                    const h = Math.floor(currentMin / 60);
                    const m = currentMin % 60;
                    availableSlots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);

                    // On avance au prochain espace logique
                    currentMin += slotStep;
                }
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

    } catch (e: any) {
        console.error("Time Engine Error: ", e);
        return ["ERROR: " + (e?.message || "Unknown error")];
    }
}

import { stripe } from "@/lib/stripe";

export async function createBooking(data: {
    staffId: string;
    serviceIds: string[];
    clientName: string;
    clientPhone: string;
    clientEmail: string;
    slotTime: Date;
    salonId: string; // Salon context
}): Promise<{ success: boolean; appointment?: any; error?: string; warning?: string; url?: string }> {
    try {
        const [salon, services, staff] = await Promise.all([
            prisma.salon.findUnique({ where: { id: data.salonId } }),
            prisma.service.findMany({ where: { id: { in: data.serviceIds } } }),
            prisma.staff.findUnique({ where: { id: data.staffId } })
        ]);

        if (!salon || services.length === 0 || !staff) {
            return { success: false, error: "Salon, services ou staff non trouvés." };
        }

        // Ordered services to calculate accurate end time
        const ordered = data.serviceIds.map(id => services.find(s => s.id === id)!).filter(Boolean);
        const totalPrice = services.reduce((sum: number, s: any) => sum + s.price, 0);

        // Acompte / Anti-lapin calculation
        let depositAmount = 0;
        const s = salon as any;
        if (s.depositType === "fixed") {
            depositAmount = s.depositValue;
        } else if (s.depositType === "percentage") {
            depositAmount = (totalPrice * s.depositValue) / 100;
        }

        // Si montant trop petit (Stripe min ~ 0.50€), on ignore
        if (depositAmount < 0.5) {
            depositAmount = 0;
        }

        const isPaymentRequired = depositAmount > 0;
        const initialStatus = isPaymentRequired ? "PENDING" : "CONFIRMED";
        const initialPaymentStatus = isPaymentRequired ? "PENDING" : "NONE";

        let currentSlotTime = data.slotTime;
        let firstAppointment: any = null;
        const apptIds: string[] = [];

        // Transaction logic: create all appointments for the multi-service booking
        for (const service of ordered) {
            // Check if already taken (par précaution)
            const existing = await (prisma.appointment as any).findFirst({
                where: {
                    staffId: data.staffId,
                    slotTime: currentSlotTime
                }
            });

            if (existing) {
                // Si c'est un PENDING abandonné ou si c'est LE MÊME client qui réessaie, on le libère
                const isVeryOldPending = existing.status === "PENDING" && (existing.createdAt < new Date(Date.now() - 15 * 60000));
                const isSameClientRetry = existing.status === "PENDING" && (existing.clientEmail === data.clientEmail || existing.clientPhone === data.clientPhone);

                if (isVeryOldPending || isSameClientRetry) {
                    await (prisma.appointment as any).delete({ where: { id: existing.id } });
                } else {
                    return { success: false, error: "Ce créneau vient d'être réservé ou est en cours de paiement par un autre client." };
                }
            }

            const appt = await (prisma.appointment as any).create({
                data: {
                    staffId: data.staffId,
                    serviceId: service.id,
                    clientName: data.clientName,
                    clientPhone: data.clientPhone,
                    clientEmail: data.clientEmail,
                    slotTime: currentSlotTime,
                    status: initialStatus,
                    paymentStatus: initialPaymentStatus,
                    isPaid: !isPaymentRequired,
                    paidAmount: isPaymentRequired ? depositAmount : 0,
                    salonId: data.salonId
                },
            });
            if (!firstAppointment) firstAppointment = appt;
            apptIds.push((appt as any).id);

            const next = new Date(currentSlotTime);
            next.setMinutes(next.getMinutes() + service.durationMin + (service.bufferTimeMin || 0));
            currentSlotTime = next;
        }

        // REDIRECTION VERS STRIPE SI PAIEMENT REQUIS
        if (isPaymentRequired) {
            const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

            const s2 = salon as any;
            const sessionOptions: any = {
                payment_method_types: ["card"],
                customer_email: data.clientEmail,
                line_items: [
                    {
                        price_data: {
                            currency: "eur",
                            product_data: {
                                name: `Acompte - ${salon.name}`,
                                description: `Réservation pour ${services.map(s => s.name).join(", ")}`,
                            },
                            unit_amount: Math.round(depositAmount * 100), // En centimes
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${baseUrl}/book/${salon.slug}?success=1&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${baseUrl}/book/${salon.slug}?error=payment_cancelled`,
                metadata: {
                    salonId: salon.id,
                    appointmentIds: JSON.stringify(apptIds),
                    type: "deposit"
                },
            };

            // IF STRIPE CONNECT IS READY, SEND MONEY TO SALON
            if (s2.stripeAccountId && s2.stripeConnected) {
                sessionOptions.payment_intent_data = {
                    transfer_data: {
                        destination: s2.stripeAccountId,
                    },
                };
            }

            const session = await stripe.checkout.sessions.create(sessionOptions);


            // Update appointments with payment ID
            await (prisma.appointment as any).updateMany({
                where: { id: { in: apptIds } },
                data: { paymentId: session.id }
            });

            return { success: true, url: session.url as string };
        }

        console.log(`[createBooking] totalPrice=${totalPrice}, depositAmount=${depositAmount}, isPaymentRequired=${isPaymentRequired}`);

        revalidatePath("/dashboard");
        return { success: true, appointment: firstAppointment };
    } catch (error: any) {
        console.error("Booking error details:", error);
        return { success: false, error: "Erreur lors de la réservation : " + (error?.message || "Erreur inconnue") };
    }
}

export async function verifyBookingPayment(sessionId: string) {
    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid") {
            const appointmentIds = JSON.parse(session.metadata?.appointmentIds || "[]");

            if (appointmentIds.length > 0) {
                await (prisma.appointment as any).updateMany({
                    where: { id: { in: appointmentIds } },
                    data: {
                        status: "CONFIRMED",
                        paymentStatus: "PAID",
                        isPaid: true
                    }
                });

                revalidatePath("/dashboard");
                return { success: true };
            }
        }

        return { success: false, error: "Payment not verified" };
    } catch (e) {
        console.error("Payment verification error:", e);
        return { success: false };
    }
}
