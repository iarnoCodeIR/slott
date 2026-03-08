import { getSalonData } from "./actions";
import BookingFlow from "./BookingFlow";
import { Calendar } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export async function generateMetadata(props: { params: Promise<{ salon: string }> }): Promise<Metadata> {
    const params = await props.params;
    const salon = await getSalonData(params.salon);

    if (!salon) return { title: "Salon introuvable | SLOTT" };

    const title = `Réserver chez ${salon.name} | SLOTT`;
    const description = salon.description || `Prenez rendez-vous en ligne chez ${salon.name}. Planning disponible 24h/24.`;

    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: salon.logo ? [salon.logo] : (salon.images && (salon.images as any).length > 0 ? [(salon.images as any)[0]] : []),
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        }
    };
}

export default async function BookingPage(props: { params: Promise<{ salon: string }> }) {
    const params = await props.params;

    const salonData: any = await getSalonData(params.salon);

    // Salon not found → branded Slott 404 page
    if (!salonData) {
        return (
            <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 text-center">
                <div className="mb-8 w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Calendar className="w-8 h-8 text-emerald-500" />
                </div>
                <p className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-500 mb-4">SLOTT</p>
                <h1 className="text-3xl font-bold mb-3 tracking-tight">Ce salon est introuvable</h1>
                <p className="text-slate-400 max-w-sm leading-relaxed mb-10">
                    Le lien que vous avez suivi ne correspond à aucun salon actif sur Slott.
                    Vérifiez l&apos;URL ou contactez le salon directement.
                </p>
                <div className="w-px h-12 bg-white/10 my-2" />
                <p className="text-slate-600 text-sm mt-4">
                    Vous êtes un professionnel ?{" "}
                    <a href="/" className="text-emerald-500 hover:text-emerald-400 font-semibold transition-colors underline underline-offset-4">
                        Créez votre page de réservation →
                    </a>
                </p>
            </div>
        );
    }

    const salon = {
        id: salonData.id,
        name: salonData.name,
        slug: salonData?.slug || params.salon,
        address: salonData.address || undefined,
        phone: salonData.phone || undefined,
        description: salonData.description || undefined,
        images: salonData.images || [],
        advanceBookingDays: salonData.advanceBookingDays || 0,
        theme: salonData.theme || "emerald",
        logo: salonData.logo || null,
        font: salonData.font || "inter",
        borderRadius: salonData.borderRadius || "smooth",
        mode: salonData.mode || "dark",
        heroImage: salonData.heroImage || null,
        depositType: salonData.depositType,
        depositValue: salonData.depositValue,
    };

    const services = salonData.services.map((s: any) => ({
        id: s.id,
        name: s.name,
        category: s.category || "Prestations",
        durationMin: s.durationMin,
        price: s.price,
    }));

    const staffList = salonData.staff.map((s: any) => ({
        id: s.id,
        name: s.name,
        role: s.role || "Coiffeur",
        workingHours: s.workingHours || {}
    }));

    return <BookingFlow salon={salon} services={services} staffList={staffList} />;
}
