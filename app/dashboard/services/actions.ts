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

export async function getServices() {
    try {
        const salon = await getUserSalon();
        return await prisma.service.findMany({
            where: { salonId: salon.id },
            orderBy: { name: 'asc' }
        });
    } catch { return []; }
}

export async function createService(data: { name: string, category: string, description: string, durationMin: number, bufferTimeMin: number, price: number }) {
    const salon = await getUserSalon();
    const service = await prisma.service.create({
        data: {
            salonId: salon.id,
            name: data.name,
            category: data.category || "Prestations",
            description: data.description,
            durationMin: data.durationMin,
            bufferTimeMin: data.bufferTimeMin,
            price: data.price
        }
    });
    revalidatePath("/dashboard/services");
    revalidatePath("/book/[salon]", "page");
    return { success: true, service };
}

export async function updateService(id: string, data: { name: string, category: string, description: string, durationMin: number, bufferTimeMin: number, price: number }) {
    const service = await prisma.service.update({
        where: { id },
        data: {
            name: data.name,
            category: data.category || "Prestations",
            description: data.description,
            durationMin: data.durationMin,
            bufferTimeMin: data.bufferTimeMin,
            price: data.price
        }
    });
    revalidatePath("/dashboard/services");
    revalidatePath("/book/[salon]", "page");
    return { success: true, service };
}

export async function deleteService(id: string) {
    try {
        await prisma.service.delete({ where: { id } });
        revalidatePath("/dashboard/services");
        revalidatePath("/book/[salon]", "page");
        return { success: true };
    } catch (e) {
        return { success: false, error: "Impossible de supprimer ce service (peut-être a-t-il des rendez-vous rattachés)." };
    }
}
