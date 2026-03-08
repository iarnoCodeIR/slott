"use client";

import React, { useState } from "react";
import { Clock, Phone, Mail, Package, Trash2, Loader2 } from "lucide-react";
import { deleteAppointment } from "./actions";
import { useRouter } from "next/navigation";

export default function AppointmentCard({ app, topOffset }: { app: any, topOffset?: number }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment annuler ce rendez-vous ?")) return;
        setIsDeleting(true);
        const res = await deleteAppointment(app.id);
        if (res.success) {
            setIsOpen(false);
            router.refresh();
        } else {
            alert(res.error || "Une erreur s'est produite");
        }
        setIsDeleting(false);
    };

    const formatTime = (hourFloat: number) => {
        const h = Math.floor(hourFloat);
        const m = Math.round((hourFloat - h) * 60);
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    const startTimeStr = formatTime(app.startHour);
    const endTimeStr = formatTime(app.startHour + app.duration);

    return (
        <>
            <div
                onClick={() => setIsOpen(true)}
                className={`absolute inset-x-4 border-l-4 rounded-r-lg p-2 ${app.bg} ${app.border} backdrop-blur-md flex flex-col justify-start shadow-lg transition-transform hover:scale-[1.01] cursor-pointer overflow-hidden leading-tight z-10`}
                style={{
                    top: topOffset !== undefined ? `${topOffset}px` : `${(app.startHour % 1) * 100}%`,
                    height: `${app.duration * 128}px`, // 1 hour = 128px (h-32)
                    minHeight: "64px" // Hauteur minimale (équivalent ~30min visuelles avec h-32) pour empêcher la coupure du texte
                }}
            >
                <div className="flex justify-between items-start">
                    <p className={`font-semibold text-sm ${app.text} truncate flex items-center gap-1.5`}>
                        {app.paymentStatus === "PENDING" && <span title="Acompte en attente">🛡️</span>}
                        {app.client}
                    </p>
                    <span className="text-[10px] font-bold opacity-80 bg-black/40 px-1.5 py-0.5 rounded-sm shrink-0 whitespace-nowrap ml-2">
                        {startTimeStr}
                    </span>
                </div>
                <p className="text-xs text-slate-300 opacity-80 truncate mt-0.5">{app.service}</p>
            </div>

            {/* Modal de Détails */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                >
                    <div
                        className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setIsOpen(false)}
                            className="absolute top-6 right-6 text-slate-500 hover:text-white bg-white/5 w-8 h-8 flex items-center justify-center rounded-full transition-colors"
                        >
                            ✕
                        </button>

                        <div className="mb-8 pr-10">
                            <h3 className="text-3xl font-bold text-white mb-2">{app.client}</h3>
                            {app.paymentStatus === "PENDING" ? (
                                <div className="inline-block bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest animate-pulse">
                                    En attente d'acompte
                                </div>
                            ) : app.paymentStatus === "FAILED" ? (
                                <div className="inline-block bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    Paiement Échoué
                                </div>
                            ) : (
                                <div className="inline-block bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                                    RDV Confirmé {app.paymentStatus === "PAID" && "(Acompte Payé)"}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="p-3 bg-white/5 rounded-xl text-emerald-500 shrink-0">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Horaire</p>
                                    <p className="font-semibold text-white">{startTimeStr} - {endTimeStr} <span className="text-slate-400 font-normal ml-1">({Math.round(app.duration * 60)} min)</span></p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="p-3 bg-white/5 rounded-xl text-white shrink-0">
                                    <Package className="w-5 h-5" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Prestation</p>
                                    <p className="font-semibold text-white">{app.service}</p>
                                </div>
                            </div>

                            <div className="border-t border-white/5 my-6"></div>

                            <div className="flex items-center gap-4 text-slate-300">
                                <div className="p-3 bg-white/5 rounded-xl text-slate-400 shrink-0">
                                    <Phone className="w-5 h-5" />
                                </div>
                                <div className="leading-tight">
                                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Téléphone</p>
                                    {app.phone ? (
                                        <a href={`tel:${app.phone}`} className="font-semibold text-white hover:text-emerald-400 hover:underline">{app.phone}</a>
                                    ) : (
                                        <p className="font-medium text-slate-500 italic">Non renseigné</p>
                                    )}
                                </div>
                            </div>

                            {app.email && (
                                <div className="flex items-center gap-4 text-slate-300">
                                    <div className="p-3 bg-white/5 rounded-xl text-slate-400 shrink-0">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <div className="leading-tight">
                                        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Email</p>
                                        <a href={`mailto:${app.email}`} className="font-semibold text-white hover:text-emerald-400 hover:underline truncate max-w-[200px] block">{app.email}</a>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 flex gap-3 pt-6 border-t border-white/5">
                            <button className="flex-1 px-4 py-3 border border-white/10 text-white font-semibold rounded-lg hover:bg-white/5 transition">Éditer (Bientôt)</button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-3 bg-red-500/10 text-red-500 font-semibold rounded-lg border border-red-500/20 hover:bg-red-500/20 transition flex items-center justify-center min-w-[120px]"
                            >
                                {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Annuler le RDV"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
