import { prisma } from "@/lib/prisma";
import { getUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";
import { CreditCard, ArrowUpRight, CheckCircle2, AlertCircle, Clock, ShoppingBag } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PaymentsPage() {
    const user = await getUser();
    if (!user) redirect("/auth/login");

    const salon = await prisma.salon.findFirst({
        where: { userId: user.id },
        include: {
            appointments: {
                where: { isPaid: true },
                include: { service: true },
                orderBy: { createdAt: "desc" }
            }
        }
    }) as any;

    if (!salon) redirect("/onboarding");

    const paidAppointments = salon.appointments || [];
    const totalRevenue = paidAppointments.reduce((sum: number, app: any) => sum + (app.paidAmount || 0), 0);

    return (
        <div className="p-10 font-sans w-full max-w-7xl mx-auto">
            <header className="flex justify-between items-end mb-10 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-normal tracking-tight mb-2">Paiements</h1>
                    <p className="text-slate-400 text-sm uppercase tracking-widest">
                        Suivez vos revenus et l'état de vos acomptes
                    </p>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-black border border-white/5 p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <ShoppingBag className="w-12 h-12 text-emerald-500" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Revenus Totaux (Acomptes)</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{totalRevenue.toFixed(2)}€</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                        <CheckCircle2 className="w-4 h-4" /> Collecté via Stripe Connect
                    </div>
                </div>

                <div className="bg-black border border-white/5 p-8 rounded-2xl relative overflow-hidden group hover:border-white/20 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <Clock className="w-12 h-12 text-white" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Transactions Payées</p>
                    <div className="flex items-baseline gap-2">
                        <span className="text-4xl font-bold text-white">{paidAppointments.length}</span>
                        <span className="text-slate-500 text-sm font-medium">paiements</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                        Depuis la création du salon
                    </div>
                </div>

                <div className="bg-black border border-white/5 p-8 rounded-2xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                        <CreditCard className="w-12 h-12 text-[#635bff]" />
                    </div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">État Stripe Connect</p>
                    <div className="flex items-baseline gap-2">
                        <span className={`text-xl font-bold ${salon.stripeConnected ? "text-white" : "text-amber-500"}`}>
                            {salon.stripeConnected ? "Opérationnel" : "Configuration requise"}
                        </span>
                    </div>
                    <div className="mt-4">
                        {salon.stripeConnected ? (
                            <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                                <CheckCircle2 className="w-4 h-4" /> Compte Vérifié
                            </div>
                        ) : (
                            <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                                <AlertCircle className="w-4 h-4" /> Finalisez l'onboarding
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-black border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-white/5 bg-white/[0.02] flex justify-between items-center">
                    <h2 className="text-lg font-medium text-white">Historique des transactions</h2>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5 bg-white/[0.01]">
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Date & Heure</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Client</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Prestation</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Montant Acompte</th>
                                <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-slate-500">Statut</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {paidAppointments.length > 0 ? (
                                paidAppointments.map((app: any) => {
                                    const price = app.service?.price || 0;
                                    let deposit = 0;
                                    if (salon.depositType === "fixed") {
                                        deposit = salon.depositValue;
                                    } else if (salon.depositType === "percentage") {
                                        deposit = (price * salon.depositValue) / 100;
                                    }

                                    return (
                                        <tr key={app.id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-medium text-white">
                                                    {new Date(app.createdAt).toLocaleDateString("fr-FR", { day: '2-digit', month: 'short', year: 'numeric' })}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5 uppercase tracking-tighter">
                                                    {new Date(app.createdAt).toLocaleTimeString("fr-FR", { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">{app.clientName}</div>
                                                <div className="text-xs text-slate-500 truncate max-w-[150px]">{app.clientEmail}</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-sm text-slate-300">{app.service?.name}</div>
                                                <div className="text-[10px] text-slate-600 uppercase font-bold tracking-widest mt-0.5">{(app.service?.price || 0).toFixed(2)}€ (Total)</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <div className="text-lg font-bold text-white leading-none">{(app.paidAmount || 0).toFixed(2)}€</div>
                                                <div className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-tighter mt-1">Transféré au salon</div>
                                            </td>
                                            <td className="px-6 py-5">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                                                    <CheckCircle2 className="w-3 h-3" /> Payé
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center gap-3">
                                            <CreditCard className="w-10 h-10 text-slate-800" />
                                            <p className="text-slate-500 font-medium">Aucune transaction pour le moment.</p>
                                            <p className="text-xs text-slate-600 max-w-xs mx-auto">
                                                Les acomptes payés par vos clients apparaîtront ici dès que vous aurez activé la protection anti-lapin.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
                    <p className="text-xs text-slate-500 italic">
                        * Les montants affichés sont hors commission de plateforme (si applicable) et frais Stripe.
                    </p>
                    <a
                        href="https://dashboard.stripe.com"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-widest"
                    >
                        Détails sur Stripe <ArrowUpRight className="w-3 h-3" />
                    </a>
                </div>
            </div>
        </div>
    );
}
