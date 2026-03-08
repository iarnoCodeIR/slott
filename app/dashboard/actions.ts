"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteAppointment(id: string) {
    try {
        await prisma.appointment.delete({
            where: { id },
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error("Delete appointment error:", error);
        return { success: false, error: "Failed to delete appointment." };
    }
}

export async function getUnreadAppointmentsCount() {
    try {
        const count = await prisma.appointment.count({
            where: { isRead: false },
        });
        return { success: true, count };
    } catch (error) {
        console.error("Get unread count error:", error);
        return { success: false, count: 0 };
    }
}

export async function markAllAppointmentsAsRead() {
    try {
        await prisma.appointment.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
        // We do not revalidatePath here because it is called during render of a Server Component
        return { success: true };
    } catch (error) {
        console.error("Mark as read error:", error);
        return { success: false, error: "Failed to mark as read." };
    }
}

export async function clearNotificationHistory() {
    try {
        await prisma.appointment.updateMany({
            data: { historyVisible: false }
        });
        revalidatePath("/dashboard/notifications");
        return { success: true };
    } catch (error) {
        console.error("Clear history error:", error);
        return { success: false, error: "Failed to clear history." };
    }
}
