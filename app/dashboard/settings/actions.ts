"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getUser } from "@/lib/supabase-server";

import { stripe } from "@/lib/stripe";

export async function getSalonSettings() {
    try {
        const user = await getUser();
        if (!user) return null;
        return await (prisma.salon as any).findFirst({ where: { userId: user.id } });
    } catch { return null; }
}

export async function createStripeConnectAccount(salonId: string) {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Non autorisé" };

        const salon: any = await prisma.salon.findUnique({ where: { id: salonId } as any });
        if (!salon || salon.userId !== user.id) return { success: false, error: "Salon non trouvé" };

        if (salon.stripeAccountId) {
            return { success: true, accountId: salon.stripeAccountId };
        }

        const account = await stripe.accounts.create({
            type: "standard", // Standard handles most of the UI/UX for us
            email: user.email!,
            capabilities: {
                card_payments: { requested: true },
                transfers: { requested: true },
            },
            business_type: "individual",
            metadata: { salonId }
        });

        await (prisma.salon as any).update({
            where: { id: salonId },
            data: { stripeAccountId: account.id }
        });

        return { success: true, accountId: account.id };
    } catch (e: any) {
        console.error("Stripe Connect error:", e);
        return { success: false, error: e.message };
    }
}

export async function getStripeOnboardingLink(salonId: string) {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Non autorisé" };

        const salon: any = await prisma.salon.findUnique({ where: { id: salonId } as any });
        if (!salon || !salon.stripeAccountId) return { success: false, error: "Compte Stripe non créé" };

        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

        const accountLink = await stripe.accountLinks.create({
            account: salon.stripeAccountId,
            refresh_url: `${baseUrl}/dashboard/settings?stripe=refresh`,
            return_url: `${baseUrl}/dashboard/settings?stripe=success`,
            type: "account_onboarding",
        });

        return { success: true, url: accountLink.url };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function checkStripeConnection(salonId: string) {
    try {
        const user = await getUser();
        if (!user) return { success: false };

        const salon: any = await prisma.salon.findUnique({ where: { id: salonId } as any });
        if (!salon || !salon.stripeAccountId) return { success: false };

        // Query Stripe for the latest account status
        const account = await stripe.accounts.retrieve(salon.stripeAccountId);

        if (account.details_submitted) {
            await (prisma.salon as any).update({
                where: { id: salonId },
                data: { stripeConnected: true }
            });
            revalidatePath("/dashboard/settings");
            return { success: true, connected: true };
        }

        return { success: true, connected: false };
    } catch (e) {
        console.error("Manual check error:", e);
        return { success: false };
    }
}

export async function updateSalonSettings(id: string, data: {
    name?: string;
    phone?: string;
    address?: string;
    description?: string;
    images?: string[];
    advanceBookingDays?: number;
    theme?: string;
    logo?: string | null;
    font?: string;
    borderRadius?: string;
    mode?: string;
    heroImage?: string | null;
    depositType?: string;
    depositValue?: number;
}) {
    try {
        const user = await getUser();
        if (!user) return { success: false, error: "Non autorisé" };

        const existingSalon: any = await prisma.salon.findUnique({
            where: { id } as any
        });

        if (!existingSalon || existingSalon.userId !== user.id) {
            return { success: false, error: "Vous n'avez pas l'autorisation de modifier ce salon." };
        }

        const salon = await (prisma.salon as any).update({
            where: { id },
            data: {
                name: data.name,
                phone: data.phone,
                address: data.address,
                description: data.description,
                images: data.images,
                advanceBookingDays: data.advanceBookingDays,
                theme: data.theme,
                logo: data.logo,
                font: data.font,
                borderRadius: data.borderRadius,
                mode: data.mode,
                heroImage: data.heroImage,
                depositType: data.depositType,
                depositValue: data.depositValue
            }
        });
        revalidatePath("/dashboard/settings");
        revalidatePath("/book/[salon]", "page");
        return { success: true, salon };
    } catch (e: any) {
        return { success: false, error: "Erreur lors de la sauvegarde des paramètres." };
    }
}
