"use client";

import React, { useState } from "react";
import { Plus } from "lucide-react";
import { createBooking } from "@/app/book/[salon]/actions";
import { useRouter } from "next/navigation";

export default function AddAppointmentModal({ staffList, servicesList, targetDate }: { staffList: any[], servicesList: any[], targetDate: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const [formData, setFormData] = useState({
        clientName: "",
        clientPhone: "",
        clientEmail: "",
        staffId: staffList[0]?.id || "",
        serviceId: servicesList[0]?.id || "",
        time: "14:00",
        date: targetDate
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            const [hours, minutes] = formData.time.split(":").map(Number);
            const [year, month, day] = formData.date.split("-").map(Number);
            // On s'assure de l'heure locale
            const slotTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

            const res = await createBooking({
                clientName: formData.clientName,
                clientPhone: formData.clientPhone,
                clientEmail: formData.clientEmail,
                serviceId: formData.serviceId,
                staffId: formData.staffId,
                slotTime
            });

            if (res.success) {
                setIsOpen(false);
                router.refresh();
            } else {
                setError(res.error || "Une erreur est survenue");
            }
        } catch (err: any) {
            setError(err.message || "Erreur de création");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-2.5 bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2"
            >
                <Plus className="w-4 h-4" /> Nouveau RDV
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setIsOpen(false)}>
                    <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl w-full max-w-md shadow-2xl relative" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-500 hover:text-white bg-white/5 w-8 h-8 flex items-center justify-center rounded-full transition-colors">✕</button>

                        <h2 className="text-2xl font-semibold mb-6 text-white">Ajouter un RDV</h2>

                        {error && <div className="mb-4 text-red-500 text-sm bg-red-500/10 p-3 rounded">{error}</div>}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Date du rendez-vous</label>
                                <input
                                    type="date"
                                    value={formData.date}
                                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <label className="block text-xs uppercase text-slate-400 mb-1">Heure de début</label>
                                    <input
                                        type="time"
                                        value={formData.time}
                                        onChange={e => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs uppercase text-slate-400 mb-1">Staff</label>
                                    <select
                                        value={formData.staffId}
                                        onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                    >
                                        {staffList.map(s => <option className="bg-black text-white" key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Prestation</label>
                                <select
                                    value={formData.serviceId}
                                    onChange={e => setFormData({ ...formData, serviceId: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:border-emerald-500 outline-none transition-colors"
                                >
                                    {servicesList.map(s => <option className="bg-black text-white" key={s.id} value={s.id}>{s.name} ({s.durationMin} min)</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Nom du client</label>
                                <input
                                    type="text"
                                    placeholder="Ex: John Doe"
                                    value={formData.clientName}
                                    onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition-colors"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-xs uppercase text-slate-400 mb-1">Téléphone (Optionnel)</label>
                                <input
                                    type="tel"
                                    placeholder="06 12 34 56 78"
                                    value={formData.clientPhone}
                                    onChange={e => setFormData({ ...formData, clientPhone: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white placeholder-slate-600 focus:border-emerald-500 outline-none transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full mt-6 bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 disabled:opacity-50 transition-colors"
                            >
                                {isLoading ? "Création..." : "Bloquer le créneau"}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
