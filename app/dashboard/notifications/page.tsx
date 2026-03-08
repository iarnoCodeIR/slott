import React from "react";
import { prisma } from "@/lib/prisma";
import { format, formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";
import { CalendarClock, CheckCircle, Clock } from "lucide-react";
import { markAllAppointmentsAsRead } from "../actions";
import ClearHistoryButton from "./ClearHistoryButton";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
    // Mark all as read directly (can't call server actions during server component render)
    try {
        await prisma.appointment.updateMany({
            where: { isRead: false },
            data: { isRead: true },
        });
    } catch (e) { }


    // 2. Fetcher les 30 derniers rendez-vous (créés récemment)
    let recentAppointments: any[] = [];
    try {
        recentAppointments = await prisma.appointment.findMany({
            where: { historyVisible: true },
            take: 30,
            orderBy: {
                createdAt: 'desc',
            },
            include: {
                service: true,
                staff: true,
            }
        });
    } catch (e) {
        console.error("DB Error fetching notifications", e);
    }

    return (
        <div className="p-10 font-sans w-full max-w-4xl mx-auto">
            <header className="mb-10 pb-6 border-b border-white/5 flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-normal tracking-tight mb-2">Notifications relatives</h1>
                    <p className="text-slate-500">Historique des dernières réservations de votre salon</p>
                </div>
                <ClearHistoryButton disabled={recentAppointments.length === 0} />
            </header>

            <div className="space-y-4">
                {recentAppointments.length === 0 ? (
                    <div className="p-10 border border-white/5 rounded-xl bg-white/5 text-center text-slate-500">
                        Aucune notification pour le moment.
                    </div>
                ) : (
                    recentAppointments.map((app) => (
                        <div key={app.id} className="p-5 border border-white/5 rounded-xl bg-[#0a0a0a] hover:bg-white/5 transition-colors flex items-start gap-5">
                            <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-full shrink-0">
                                <CalendarClock className="w-6 h-6" />
                            </div>

                            <div className="flex-1">
                                <p className="text-white text-lg">
                                    <span className="font-bold">{app.clientName}</span> a réservé un créneau avec <span className="text-emerald-400 font-medium">{app.staff?.name}</span>.
                                </p>
                                <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
                                    <span className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded">
                                        <Clock className="w-3.5 h-3.5" />
                                        {format(new Date(app.slotTime), "EEEE d MMMM 'à' HH:mm", { locale: fr })}
                                    </span>
                                    <span>•</span>
                                    <span>{app.service?.name}</span>
                                </div>
                            </div>

                            <div className="text-xs text-slate-600 font-medium shrink-0 whitespace-nowrap text-right">
                                {formatDistanceToNow(new Date(app.createdAt), { addSuffix: true, locale: fr })}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
