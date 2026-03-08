import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import AppointmentCard from "./AppointmentCard";
import AddAppointmentModal from "./AddAppointmentModal";
import { getUser } from "@/lib/supabase-server";

export const dynamic = "force-dynamic"; // Ensures fresh dashboard data

export default async function DashboardAgenda(props: { searchParams: Promise<{ date?: string }> }) {
    const searchParams = await props.searchParams;

    // Get current user and their salon
    const user = await getUser();
    if (!user) redirect("/auth/login");

    const salon = await prisma.salon.findFirst({ where: { userId: user.id } }).catch(() => null);
    if (!salon) redirect("/onboarding");

    const hours = Array.from({ length: 11 }, (_, i) => i + 9); // 9h à 19h

    const today = new Date();
    const targetDateStr = searchParams.date || `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const targetDate = new Date(`${targetDateStr}T12:00:00`);

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const isToday = startOfDay.toDateString() === today.toDateString();
    const currentHourFloat = today.getHours() + (today.getMinutes() / 60);

    const prevDate = new Date(targetDate);
    prevDate.setDate(prevDate.getDate() - 1);
    const nextDate = new Date(targetDate);
    nextDate.setDate(nextDate.getDate() + 1);

    const formatDt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    // Fetch staff for this salon only
    let staffList: any[] = [];
    try {
        staffList = await prisma.staff.findMany({
            where: { salonId: salon.id },
            orderBy: { name: 'asc' },
            include: {
                appointments: {
                    where: {
                        slotTime: {
                            gte: startOfDay,
                            lte: endOfDay
                        }
                    },
                    include: { service: true },
                    orderBy: { slotTime: "asc" },
                }
            }
        });
    } catch (error) {
        console.warn("DB error:", error);
    }

    // Ensure staff list is not empty for demo purposes if DB fails
    if (staffList.length === 0) {
        staffList = [{ id: "mock", name: "Mock Staff", appointments: [] }];
    }

    // Prepare list of services for this salon only
    let servicesList: any[] = [];
    try {
        servicesList = await prisma.service.findMany({ where: { salonId: salon.id }, orderBy: { name: 'asc' } });
    } catch (e) { }

    return (
        <div className="p-10 font-sans w-full max-w-7xl mx-auto">
            <header className="flex justify-between items-end mb-10 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-normal tracking-tight mb-2">Agenda</h1>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/5">
                            <Link href={`/dashboard?date=${formatDt(prevDate)}`} className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white">
                                <ChevronLeft className="w-5 h-5" />
                            </Link>
                            <p className="text-slate-200 text-sm font-medium tracking-widest uppercase px-4 min-w-[180px] text-center">
                                {targetDate.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
                            </p>
                            <Link href={`/dashboard?date=${formatDt(nextDate)}`} className="p-1 hover:bg-white/10 rounded-md transition-colors text-slate-400 hover:text-white">
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </div>

                        {!isToday && (
                            <Link href={`/dashboard`} className="text-[11px] font-bold tracking-widest px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 rounded-md transition-colors border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                RETOUR À AUJOURD'HUI
                            </Link>
                        )}
                    </div>
                </div>
                <div className="flex gap-4">
                    <button className="px-5 py-2.5 border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all">Staff: Jean</button>
                    <AddAppointmentModal
                        staffList={staffList.map(s => ({ id: s.id, name: s.name }))}
                        servicesList={servicesList}
                        targetDate={formatDt(targetDate)}
                    />
                </div>
            </header>

            <div className="bg-black border border-white/5 overflow-x-auto relative rounded-xl shadow-2xl">
                <div className="flex min-w-max">
                    {/* Colonne des heures (gauche) */}
                    <div className="w-20 shrink-0 sticky left-0 z-30 bg-black/95 backdrop-blur-sm border-r border-white/5">
                        <div className="h-14 border-b border-white/5"></div> {/* Espace en-tête */}
                        {hours.map((hour) => (
                            <div key={`time-${hour}`} className="h-32 border-b border-white/5 relative">
                                <div className="absolute top-0 right-3 -translate-y-3/4 text-sm font-medium text-slate-500">
                                    {hour}:00
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Ligne rouge de l'heure actuelle (partagée sur tout le tableau) */}
                    {isToday && currentHourFloat >= Math.min(...hours) && currentHourFloat <= Math.max(...hours) + 1 && (
                        <div
                            className="absolute left-20 right-0 border-b-2 border-emerald-500 z-20 shadow-[0_0_10px_rgba(16,185,129,0.8)] pointer-events-none"
                            style={{ top: `${56 + (currentHourFloat - Math.min(...hours)) * 128}px` }} // 56px = hauteur de l'en-tête (h-14)
                        >
                            <div className="absolute -left-1 -top-[3px] w-2 h-2 rounded-full bg-emerald-500"></div>
                        </div>
                    )}

                    {/* Colonnes par employé */}
                    {staffList.map((staff, index) => (
                        <div key={staff.id} className={`w-72 shrink-0 flex flex-col ${index < staffList.length - 1 ? 'border-r border-white/5' : ''}`}>
                            {/* En-tête de la colonne (Nom de l'employé) */}
                            <div className="h-14 border-b border-white/5 flex items-center justify-center bg-white/5 sticky top-0 z-20">
                                <span className="font-semibold text-white tracking-wide">{staff.name}</span>
                            </div>

                            {/* Grille de la journée pour cet employé */}
                            <div className="relative flex-1">
                                {hours.map((hour) => (
                                    <div key={`grid-${staff.id}-${hour}`} className="h-32 border-b border-white/5 border-dashed relative">
                                        <div className="absolute top-1/2 left-0 right-0 border-b border-dashed border-white/5" />
                                    </div>
                                ))}

                                {/* Les rendez-vous de l'employé */}
                                {staff.appointments.map((app: any) => {
                                    const startHour = app.slotTime.getHours() + (app.slotTime.getMinutes() / 60);
                                    const durationMin = app.service?.durationMin || 30;
                                    const duration = durationMin / 60;

                                    const appFormatted = {
                                        id: app.id,
                                        client: app.clientName,
                                        service: app.service?.name || "Service Inconnu",
                                        phone: app.clientPhone,
                                        email: app.clientEmail,
                                        startHour,
                                        duration,
                                        bg: "bg-emerald-500/10",
                                        border: "border-emerald-500/30",
                                        text: "text-emerald-400",
                                        paymentStatus: app.paymentStatus,
                                        status: app.status
                                    };

                                    return (
                                        <AppointmentCard
                                            key={app.id}
                                            app={appFormatted}
                                            // The first hour in the grid is Math.min(...hours), top offset is relative to that
                                            topOffset={(startHour - Math.min(...hours)) * 128}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
