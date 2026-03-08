"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase-server";

async function getUserSalon() {
    const user = await getUser();
    if (!user) throw new Error("Non authentifié");
    const salon = await prisma.salon.findFirst({ where: { userId: user.id } });
    if (!salon) throw new Error("Salon introuvable");
    return salon;
}

export async function getStaff() {
    try {
        const salon = await getUserSalon();
        return await prisma.staff.findMany({
            where: { salonId: salon.id },
            orderBy: { name: 'asc' }
        });
    } catch { return []; }
}

export async function createStaff(data: { name: string, role: string }) {
    const salon = await getUserSalon();
    const staff = await prisma.staff.create({
        data: { salonId: salon.id, name: data.name, role: data.role }
    });
    revalidatePath("/dashboard/staff");
    revalidatePath("/book/[salon]", "page");
    return { success: true, staff };
}

export async function updateStaff(id: string, data: { name: string, role: string }) {
    try {
        const staff = await prisma.staff.update({
            where: { id },
            data: { name: data.name, role: data.role }
        });
        revalidatePath("/dashboard/staff");
        revalidatePath("/book/[salon]", "page");
        return { success: true, staff };
    } catch (e: any) {
        return { success: false, error: e.message || "Erreur lors de la mise à jour." };
    }
}

export async function updateStaffHours(id: string, workingHours: any) {
    try {
        const staff = await prisma.staff.update({
            where: { id },
            data: { workingHours }
        });
        revalidatePath("/dashboard/staff");
        revalidatePath("/book/[salon]", "page");
        return { success: true, staff };
    } catch (e: any) {
        return { success: false, error: e.message || "Erreur lors de la mise à jour des horaires." };
    }
}

export async function deleteStaff(id: string) {
    try {
        await prisma.staff.delete({ where: { id } });
        revalidatePath("/dashboard/staff");
        revalidatePath("/book/[salon]", "page");
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message || "Impossible de supprimer cet employé. Il a probablement des rendez-vous assignés." };
    }
}
