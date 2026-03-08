import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
    const user = await getUser();
    if (!user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

    const { salon, service, staff } = await req.json();

    if (!salon?.name || !salon?.slug) {
        return NextResponse.json({ error: "Nom et slug requis" }, { status: 400 });
    }

    try {
        // Check slug is unique
        const existing = await prisma.salon.findUnique({ where: { slug: salon.slug } });
        if (existing) {
            return NextResponse.json({ error: "Ce lien est déjà utilisé, choisissez-en un autre." }, { status: 400 });
        }

        // Create salon linked to this user
        const newSalon = await prisma.salon.create({
            data: {
                userId: user.id,
                name: salon.name,
                slug: salon.slug,
                phone: salon.phone || null,
                address: salon.address || null,
            },
        });

        // Create first service (optional)
        let staffRecord = null;
        if (service?.name) {
            await prisma.service.create({
                data: {
                    salonId: newSalon.id,
                    name: service.name,
                    durationMin: service.durationMin || 30,
                    price: service.price || 0,
                    category: "Prestations",
                },
            });
        }

        // Create first staff member (optional)
        if (staff?.name) {
            staffRecord = await prisma.staff.create({
                data: {
                    salonId: newSalon.id,
                    name: staff.name,
                    role: staff.role || "",
                },
            });
        }

        // Link subscription to this userId
        await prisma.subscription.updateMany({
            where: { email: user.email! },
            data: { userId: user.id },
        });

        return NextResponse.json({ success: true, salonSlug: newSalon.slug });
    } catch (err: any) {
        console.error("Onboarding error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
