"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Store, Scissors, Users, CheckCircle2, ChevronRight, ChevronLeft } from "lucide-react";

const steps = [
    { id: 1, label: "Votre salon", icon: Store },
    { id: 2, label: "Votre première prestation", icon: Scissors },
    { id: 3, label: "Votre équipe", icon: Users },
];

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    // Step 1 - Salon info
    const [salonName, setSalonName] = useState("");
    const [salonSlug, setSalonSlug] = useState("");
    const [salonPhone, setSalonPhone] = useState("");
    const [salonAddress, setSalonAddress] = useState("");

    // Step 2 - First service
    const [serviceName, setServiceName] = useState("");
    const [serviceDuration, setServiceDuration] = useState("30");
    const [servicePrice, setServicePrice] = useState("");
    const [skipService, setSkipService] = useState(false);

    // Step 3 - First staff
    const [staffName, setStaffName] = useState("");
    const [staffRole, setStaffRole] = useState("");
    const [skipStaff, setSkipStaff] = useState(false);

    const handleSlugInput = (val: string) => {
        setSalonSlug(val.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""));
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await fetch("/api/onboarding", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    salon: { name: salonName, slug: salonSlug, phone: salonPhone, address: salonAddress },
                    service: skipService ? null : { name: serviceName, durationMin: parseInt(serviceDuration), price: parseFloat(servicePrice) },
                    staff: skipStaff ? null : { name: staffName, role: staffRole },
                }),
            });
            const data = await res.json();
            if (data.success) {
                router.push("/dashboard");
                router.refresh();
            } else {
                setError(data.error || "Une erreur s'est produite.");
                setLoading(false);
            }
        } catch {
            setError("Erreur réseau.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6 py-12">
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-2xl font-bold tracking-tighter mb-12 text-center">
                    SLO<span className="text-emerald-500">T</span>T
                </div>

                {/* Stepper */}
                <div className="flex items-center justify-center gap-2 mb-10">
                    {steps.map((s, i) => {
                        const Icon = s.icon;
                        const isActive = s.id === step;
                        const isDone = s.id < step;
                        return (
                            <React.Fragment key={s.id}>
                                {i > 0 && <div className={`flex-1 h-0.5 max-w-12 ${isDone ? "bg-emerald-500" : "bg-white/10"} transition-colors`} />}
                                <div className={`flex flex-col items-center gap-1.5`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${isActive ? "border-emerald-500 bg-emerald-500/10" : isDone ? "border-emerald-500 bg-emerald-500" : "border-white/10 bg-white/5"}`}>
                                        {isDone
                                            ? <CheckCircle2 className="w-5 h-5 text-white" />
                                            : <Icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : "text-slate-500"}`} />}
                                    </div>
                                    <p className={`text-[10px] font-semibold uppercase tracking-wider ${isActive ? "text-emerald-500" : isDone ? "text-slate-400" : "text-slate-600"}`}>{s.label}</p>
                                </div>
                            </React.Fragment>
                        );
                    })}
                </div>

                {/* Step content */}
                <AnimatePresence mode="wait">
                    {step === 1 && (
                        <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-2xl font-bold mb-2">Votre salon</h2>
                            <p className="text-slate-400 text-sm mb-6">Ces infos apparaîtront sur votre page de réservation.</p>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Nom du salon *</label>
                                    <input value={salonName} onChange={e => { setSalonName(e.target.value); handleSlugInput(e.target.value); }}
                                        placeholder="Ex: Studio Marie" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">URL de réservation *</label>
                                    <div className="flex items-center gap-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-500/50">
                                        <span className="text-slate-500 text-sm px-4 border-r border-white/10 py-4 whitespace-nowrap">/book/</span>
                                        <input value={salonSlug} onChange={e => handleSlugInput(e.target.value)}
                                            placeholder="studio-marie" className="flex-1 bg-transparent p-4 text-white placeholder:text-slate-600 focus:outline-none" />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Téléphone</label>
                                        <input value={salonPhone} onChange={e => setSalonPhone(e.target.value)}
                                            placeholder="06 00 00 00 00" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Adresse</label>
                                        <input value={salonAddress} onChange={e => setSalonAddress(e.target.value)}
                                            placeholder="12 rue de la Paix, Paris" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => salonName && salonSlug && setStep(2)} disabled={!salonName || !salonSlug}
                                className="w-full mt-8 bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
                                Continuer <ChevronRight className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}

                    {step === 2 && (
                        <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-2xl font-bold mb-2">Votre première prestation</h2>
                            <p className="text-slate-400 text-sm mb-6">Ajoutez-en une maintenant ou plus tard depuis le dashboard.</p>
                            {!skipService && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Nom de la prestation</label>
                                        <input value={serviceName} onChange={e => setServiceName(e.target.value)}
                                            placeholder="Ex: Coupe femme" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Durée (minutes)</label>
                                            <input type="number" value={serviceDuration} onChange={e => setServiceDuration(e.target.value)}
                                                placeholder="30" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Prix (€)</label>
                                            <input type="number" value={servicePrice} onChange={e => setServicePrice(e.target.value)}
                                                placeholder="25" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setSkipService(!skipService)} className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors w-full text-center">
                                {skipService ? "↩ Ajouter une prestation" : "Passer cette étape →"}
                            </button>
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep(1)} className="flex-1 bg-white/5 text-white font-bold rounded-xl p-4 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Retour
                                </button>
                                <button onClick={() => setStep(3)} className="flex-1 bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2">
                                    Continuer <ChevronRight className="w-5 h-5" />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {step === 3 && (
                        <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                            <h2 className="text-2xl font-bold mb-2">Votre équipe</h2>
                            <p className="text-slate-400 text-sm mb-6">Ajoutez-vous ou un membre de votre équipe. Modifiable à tout moment.</p>
                            {!skipStaff && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Prénom Nom</label>
                                        <input value={staffName} onChange={e => setStaffName(e.target.value)}
                                            placeholder="Ex: Marie Dupont" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 uppercase tracking-wider font-semibold block mb-2">Rôle / Spécialité</label>
                                        <input value={staffRole} onChange={e => setStaffRole(e.target.value)}
                                            placeholder="Ex: Coiffeuse, Esthéticienne..." className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />
                                    </div>
                                </div>
                            )}
                            <button onClick={() => setSkipStaff(!skipStaff)} className="mt-4 text-sm text-slate-500 hover:text-slate-300 transition-colors w-full text-center">
                                {skipStaff ? "↩ Ajouter un membre" : "Passer cette étape →"}
                            </button>
                            {error && <p className="text-red-400 text-sm text-center mt-4">{error}</p>}
                            <div className="flex gap-3 mt-6">
                                <button onClick={() => setStep(2)} className="flex-1 bg-white/5 text-white font-bold rounded-xl p-4 hover:bg-white/10 transition-all flex items-center justify-center gap-2">
                                    <ChevronLeft className="w-5 h-5" /> Retour
                                </button>
                                <button onClick={handleSubmit} disabled={loading}
                                    className="flex-1 bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                                    {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Création...</> : <><CheckCircle2 className="w-5 h-5" /> Lancer mon salon</>}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
