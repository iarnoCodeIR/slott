"use client";

import React, { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Clock, CheckCircle2, ChevronRight, Loader2, CalendarPlus, MapPin, Phone, Plus, X, AlertCircle } from "lucide-react";
import { createBooking, getAvailableSlots, verifyBookingPayment } from "./actions";
import { useSearchParams } from "next/navigation";


type Props = {
    salon: {
        id: string;
        name: string;
        slug: string;
        advanceBookingDays?: number;
        address?: string;
        phone?: string;
        description?: string;
        images?: string[];
        theme?: string;
        logo?: string | null;
        font?: string;
        borderRadius?: string;
        mode?: string;
        heroImage?: string | null;
        depositType?: string;
        depositValue?: number;
    };
    services: { id: string; name: string; durationMin: number; price: number; category?: string }[];
    staffList: { id: string; name: string; role: string; workingHours?: any }[];
};


const themeConfig = {
    "emerald": {
        text: "text-emerald-500",
        bg: "bg-emerald-500",
        border: "border-emerald-500",
        hoverBorder: "hover:border-emerald-500/50",
        ring: "ring-emerald-500/50",
        checkedBg: "checked:bg-emerald-500",
        bgLight: "bg-emerald-500/10",
        borderLight: "border-emerald-500/20"
    },
    "blue": {
        text: "text-blue-500",
        bg: "bg-blue-500",
        border: "border-blue-500",
        hoverBorder: "hover:border-blue-500/50",
        ring: "ring-blue-500/50",
        checkedBg: "checked:bg-blue-500",
        bgLight: "bg-blue-500/10",
        borderLight: "border-blue-500/20"
    },
    "violet": {
        text: "text-violet-500",
        bg: "bg-violet-500",
        border: "border-violet-500",
        hoverBorder: "hover:border-violet-500/50",
        ring: "ring-violet-500/50",
        checkedBg: "checked:bg-violet-500",
        bgLight: "bg-violet-500/10",
        borderLight: "border-violet-500/20"
    },
    "rose": {
        text: "text-rose-500",
        bg: "bg-rose-500",
        border: "border-rose-500",
        hoverBorder: "hover:border-rose-500/50",
        ring: "ring-rose-500/50",
        checkedBg: "checked:bg-rose-500",
        bgLight: "bg-rose-500/10",
        borderLight: "border-rose-500/20"
    },
    "amber": {
        text: "text-amber-500",
        bg: "bg-amber-500",
        border: "border-amber-500",
        hoverBorder: "hover:border-amber-500/50",
        ring: "ring-amber-500/50",
        checkedBg: "checked:bg-amber-500",
        bgLight: "bg-amber-500/10",
        borderLight: "border-amber-500/20"
    },
    "red": {
        text: "text-red-500",
        bg: "bg-red-500",
        border: "border-red-500",
        hoverBorder: "hover:border-red-500/50",
        ring: "ring-red-500/50",
        checkedBg: "checked:bg-red-500",
        bgLight: "bg-red-500/10",
        borderLight: "border-red-500/20"
    },
    "orange": {
        text: "text-orange-500",
        bg: "bg-orange-500",
        border: "border-orange-500",
        hoverBorder: "hover:border-orange-500/50",
        ring: "ring-orange-500/50",
        checkedBg: "checked:bg-orange-500",
        bgLight: "bg-orange-500/10",
        borderLight: "border-orange-500/20"
    },
    "lime": {
        text: "text-lime-500",
        bg: "bg-lime-500",
        border: "border-lime-500",
        hoverBorder: "hover:border-lime-500/50",
        ring: "ring-lime-500/50",
        checkedBg: "checked:bg-lime-500",
        bgLight: "bg-lime-500/10",
        borderLight: "border-lime-500/20"
    },
    "cyan": {
        text: "text-cyan-500",
        bg: "bg-cyan-500",
        border: "border-cyan-500",
        hoverBorder: "hover:border-cyan-500/50",
        ring: "ring-cyan-500/50",
        checkedBg: "checked:bg-cyan-500",
        bgLight: "bg-cyan-500/10",
        borderLight: "border-cyan-500/20"
    },
    "fuchsia": {
        text: "text-fuchsia-500",
        bg: "bg-fuchsia-500",
        border: "border-fuchsia-500",
        hoverBorder: "hover:border-fuchsia-500/50",
        ring: "ring-fuchsia-500/50",
        checkedBg: "checked:bg-fuchsia-500",
        bgLight: "bg-fuchsia-500/10",
        borderLight: "border-fuchsia-500/20"
    },
    "indigo": {
        text: "text-indigo-500",
        bg: "bg-indigo-500",
        border: "border-indigo-500",
        hoverBorder: "hover:border-indigo-500/50",
        ring: "ring-indigo-500/50",
        checkedBg: "checked:bg-indigo-500",
        bgLight: "bg-indigo-500/10",
        borderLight: "border-indigo-500/20"
    },
    "slate": {
        text: "text-slate-300",
        bg: "bg-slate-300",
        border: "border-slate-300",
        hoverBorder: "hover:border-slate-300/50",
        ring: "ring-slate-300/50",
        checkedBg: "checked:bg-slate-300",
        bgLight: "bg-slate-300/10",
        borderLight: "border-slate-300/20"
    }
} as const;

type ThemeKey = keyof typeof themeConfig;

// ── Horizontal Day Strip ─────────────────────────────────────────────────────
function DayStrip({ selectedDate, onChange, advanceBookingDays, t }: {
    selectedDate: string;
    onChange: (date: string) => void;
    advanceBookingDays?: number;
    t: typeof themeConfig[ThemeKey];
}) {
    const days: Date[] = [];
    const today = new Date();
    const start = new Date(today);
    if (advanceBookingDays && advanceBookingDays > 0)
        start.setDate(start.getDate() + advanceBookingDays);
    for (let i = 0; i < 28; i++) {
        const d = new Date(start);
        d.setDate(d.getDate() + i);
        days.push(d);
    }
    const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
    const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Jun", "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc"];
    const toLocalStr = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = toLocalStr(today);
    return (
        <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-none -mx-4 px-4">
            {days.map(day => {
                const dateStr = toLocalStr(day);
                const isSelected = selectedDate === dateStr;
                const isToday = dateStr === todayStr;
                return (
                    <button
                        key={dateStr}
                        onClick={() => onChange(dateStr)}
                        className={`shrink-0 flex flex-col items-center gap-0.5 w-[52px] py-3 px-1 rounded-2xl border-2 transition-all duration-200 ${isSelected
                            ? `${t.bg} border-transparent shadow-lg`
                            : "border-white/10 bg-white/5 hover:border-white/25"
                            }`}
                    >
                        <span className={`text-[10px] font-semibold uppercase tracking-wide ${isSelected ? "text-black" : "text-slate-500"}`}>
                            {dayLabels[day.getDay()]}
                        </span>
                        <span className={`text-lg font-bold leading-tight ${isSelected ? "text-black" : "text-white"}`}>
                            {day.getDate()}
                        </span>
                        <span className={`text-[9px] ${isSelected ? "text-black/60" : "text-slate-600"}`}>
                            {monthLabels[day.getMonth()]}
                        </span>
                        {isToday && !isSelected && (
                            <div className={`w-1.5 h-1.5 rounded-full ${t.bg} mt-0.5`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

function BookingFlowContent({ salon, services, staffList }: Props) {
    const t = themeConfig[(salon.theme as ThemeKey) || "emerald"] || themeConfig["emerald"];

    const fontClass = {
        "inter": "font-sans",
        "playfair": "font-serif",
        "nunito": "font-sans", // Fallback to sans for next/font default
        "teko": "font-sans uppercase",
        "mono": "font-mono",
    }[salon.font || "inter"] || "font-sans";

    const radiusBtn = {
        "sharp": "rounded-none",
        "smooth": "rounded-xl",
        "rounded": "rounded-[2rem]"
    }[salon.borderRadius || "smooth"] || "rounded-xl";

    const modeConfig = {
        "dark": {
            bgApp: "bg-[#050505]",
            textApp: "text-slate-50",
            textMuted: "text-slate-400",
            bgCard: "bg-white/5",
            borderMuted: "border-white/10",
            headerBg: "bg-gradient-to-tr from-slate-900 via-black to-slate-900",
            headerText: "text-white",
            headerMuted: "text-slate-300",
            overlay: true,
            avatarBg: "bg-slate-800"
        },
        "light": {
            bgApp: "bg-slate-50",
            textApp: "text-slate-900",
            textMuted: "text-slate-600",
            bgCard: "bg-white shadow-sm",
            borderMuted: "border-slate-200",
            headerBg: "bg-slate-200",
            headerText: "text-slate-900",
            headerMuted: "text-slate-600",
            overlay: false,
            avatarBg: "bg-slate-200"
        },
        "cream": {
            bgApp: "bg-[#FDFBF7]",
            textApp: "text-[#4A4036]",
            textMuted: "text-[#8C7A6B]",
            bgCard: "bg-white shadow-sm",
            borderMuted: "border-[#E8E0D5]",
            headerBg: "bg-[#E8E0D5]",
            headerText: "text-[#2C1E16]",
            headerMuted: "text-[#4A4036]",
            overlay: false,
            avatarBg: "bg-[#E8E0D5]"
        },
        "espresso": {
            bgApp: "bg-[#2C1E16]",
            textApp: "text-[#E8E0D5]",
            textMuted: "text-[#8C7A6B]",
            bgCard: "bg-[#4A4036]/20",
            borderMuted: "border-[#4A4036]",
            headerBg: "bg-gradient-to-tr from-[#1A120D] via-[#2C1E16] to-[#1A120D]",
            headerText: "text-[#FDFBF7]",
            headerMuted: "text-[#E8E0D5]",
            overlay: true,
            avatarBg: "bg-[#4A4036]"
        },
        "navy": {
            bgApp: "bg-[#0A1128]",
            textApp: "text-[#F4F7FB]",
            textMuted: "text-[#8EA4D2]",
            bgCard: "bg-[#1C2C5E]/20",
            borderMuted: "border-[#1C2C5E]",
            headerBg: "bg-gradient-to-tr from-[#050814] via-[#0A1128] to-[#050814]",
            headerText: "text-white",
            headerMuted: "text-[#D1DDF9]",
            overlay: true,
            avatarBg: "bg-[#1C2C5E]"
        },
        "midnight": {
            bgApp: "bg-[#0F0A1F]",
            textApp: "text-[#EBE8F4]",
            textMuted: "text-[#9884C6]",
            bgCard: "bg-[#2D1F54]/20",
            borderMuted: "border-[#2D1F54]",
            headerBg: "bg-gradient-to-tr from-[#080510] via-[#0F0A1F] to-[#080510]",
            headerText: "text-white",
            headerMuted: "text-[#CDBEEE]",
            overlay: true,
            avatarBg: "bg-[#2D1F54]"
        }
    } as const;

    type ModeKey = keyof typeof modeConfig;
    const m = modeConfig[(salon.mode as ModeKey) || "dark"] || modeConfig["dark"];

    const bgApp = m.bgApp;
    const textApp = m.textApp;
    const textMuted = m.textMuted;
    const bgCard = m.bgCard;
    const borderMuted = m.borderMuted;

    const [selectedServices, setSelectedServices] = useState<Props["services"]>([]);
    const selectedService = selectedServices[0] || null; // alias for backward compat
    const totalDuration = selectedServices.reduce((sum: number, s: any) => sum + s.durationMin, 0);
    const totalPrice = selectedServices.reduce((sum: number, s: any) => sum + s.price, 0);
    const [selectedStaff, setSelectedStaff] = useState<Props["staffList"][0] | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>(() => {
        const d = new Date();
        if (salon.advanceBookingDays) d.setDate(d.getDate() + salon.advanceBookingDays);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    });
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const searchParams = useSearchParams();
    const [step, setStep] = useState<"service" | "staff" | "time" | "checkout" | "success">("service");

    useEffect(() => {
        const finalize = async () => {
            const sid = searchParams?.get("session_id");
            if (searchParams?.get("success") === "1") {
                setStep("success");
                if (sid) {
                    await verifyBookingPayment(sid);
                }
            }
        };
        finalize();
    }, [searchParams]);

    const [activeTab, setActiveTab] = useState<"prestations" | "enseigne">("prestations");
    const [selectedImageIdx, setSelectedImageIdx] = useState(0);

    const [availableSlots, setAvailableSlots] = useState<string[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);

    useEffect(() => {
        if (step === "time" && selectedServices.length > 0 && selectedStaff) {
            setLoadingSlots(true);
            getAvailableSlots(selectedStaff.id, selectedServices.map(s => s.id), selectedDate).then(slots => {
                setAvailableSlots(slots);
                setLoadingSlots(false);
            });
        }
    }, [step, selectedDate, selectedServices, selectedStaff]);

    const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedServices.length === 0 || !selectedSlot || !selectedStaff) {
            setError("Informations manquantes pour la réservation.");
            return;
        }

        setLoading(true);
        setError("");

        // Convert date + slot to a real Date object in production
        const [year, month, day] = selectedDate.split("-").map(Number);
        const [hours, minutes] = selectedSlot.split(":").map(Number);
        const slotTime = new Date(year, month - 1, day, hours, minutes, 0, 0);

        const res = await createBooking({
            staffId: selectedStaff.id,
            serviceIds: selectedServices.map(s => s.id),
            clientName: formData.name,
            clientPhone: formData.phone,
            clientEmail: formData.email,
            slotTime,
            salonId: salon.id
        });

        setLoading(false);

        if (res.success) {
            if (res.url) {
                // Rediriger vers l'acompte Stripe
                window.location.href = res.url;
            } else {
                setStep("success");
            }
        } else {
            setError(res.error || "Une erreur s'est produite.");
        }
    };

    const handleAddToGoogleCalendar = () => {
        if (selectedServices.length === 0 || !selectedSlot) return;
        const [hours, minutes] = selectedSlot.split(":").map(Number);
        const startDate = new Date(selectedDate);
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMinutes(startDate.getMinutes() + totalDuration);
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        const serviceNames = selectedServices.map(s => s.name).join(' + ');
        const text = encodeURIComponent(`RDV ${salon.name} - ${serviceNames}`);
        const details = encodeURIComponent(`Rendez-vous chez ${salon.name} pour ${serviceNames}.`);
        const dates = `${formatDate(startDate)}/${formatDate(endDate)}`;
        const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&details=${details}&dates=${dates}`;
        window.open(url, '_blank');
    };

    const handleAddToAppleCalendar = () => {
        if (selectedServices.length === 0 || !selectedSlot) return;
        const [hours, minutes] = selectedSlot.split(":").map(Number);
        const startDate = new Date(selectedDate);
        startDate.setHours(hours, minutes, 0, 0);
        const endDate = new Date(startDate);
        endDate.setMinutes(startDate.getMinutes() + totalDuration);
        const formatDate = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');
        const serviceNames = selectedServices.map(s => s.name).join(' + ');
        const icsContent = [
            "BEGIN:VCALENDAR", "VERSION:2.0", "BEGIN:VEVENT",
            `DTSTART:${formatDate(startDate)}`, `DTEND:${formatDate(endDate)}`,
            `SUMMARY:RDV ${salon.name} - ${serviceNames}`,
            `DESCRIPTION:Rendez-vous chez ${salon.name} pour ${serviceNames}.`,
            "END:VEVENT", "END:VCALENDAR"
        ].join("\n");
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `rdv-${salon.slug}.ics`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className={`min-h-screen ${bgApp} ${textApp} ${fontClass} flex flex-col items-center transition-colors duration-300`}>
            {/* HERO HEADER ONLY ON SERVICE STEP */}
            {step === "service" && (
                <div className={`w-full h-48 md:h-56 ${m.headerBg} border-b ${m.borderMuted} relative shrink-0 overflow-hidden`}>
                    {/* Background Hero Image */}
                    {salon.heroImage && (
                        <div className="absolute inset-0">
                            <img src={salon.heroImage} alt="Cover" className="w-full h-full object-cover" />
                            <div className={`absolute inset-0 ${m.overlay ? "bg-black/60" : "bg-white/40"}`}></div>
                        </div>
                    )}
                    {m.overlay && <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-black/20 to-transparent" />}
                    <div className="absolute inset-0 flex justify-center">
                        <div className="w-full max-w-3xl h-full relative px-4 text-shadow-sm">
                            <div className="absolute bottom-6 left-4 right-4 z-10">
                                {salon.logo ? (
                                    <div className="flex items-center gap-4 mb-2">
                                        <img src={salon.logo} alt={salon.name} className="h-14 w-auto object-contain bg-black/10 rounded-xl p-1.5 backdrop-blur-sm" />
                                        <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${salon.heroImage && m.overlay ? "text-white" : m.headerText}`}>{salon.name}</h1>
                                    </div>
                                ) : (
                                    <h1 className={`text-4xl md:text-5xl font-bold tracking-tight ${salon.heroImage && m.overlay ? "text-white" : m.headerText}`}>{salon.name}</h1>
                                )}
                                {salon.address && (
                                    <p className={`text-sm md:text-base ${salon.heroImage && m.overlay ? "text-slate-200" : m.headerMuted} mt-2 flex items-center gap-2 font-medium`}>
                                        <MapPin className={`w-4 h-4 ${t.text}`} /> {salon.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MINIMAL HEADER FOR OTHER STEPS */}
            {step !== "service" && (
                <header className="w-full max-w-3xl flex justify-between items-center py-6 px-4 shrink-0">
                    <div className="flex flex-col">
                        <button onClick={() => setStep("service")} className={`text-2xl font-bold tracking-tighter leading-none hover:opacity-80 transition-opacity text-left flex items-center gap-3 ${m.textApp}`}>
                            {salon.logo && (
                                <img src={salon.logo} alt={salon.name} className="h-8 w-auto object-contain rounded" />
                            )}
                            {salon.logo ? <span>{salon.name}</span> : <>SLO<span className={t.text}>T</span>T</>}
                        </button>
                        {!salon.logo && (
                            <a href="https://codeir.net" target="_blank" rel="noopener noreferrer" className={`text-[9px] font-bold ${t.text}/80 tracking-widest uppercase mt-1 hover:${t.text} transition-colors`}>
                                by Code IR
                            </a>
                        )}
                    </div>
                    {salon.logo && (
                        <div className="flex flex-col items-end text-right">
                            <p className="text-sm font-medium">{salon.name}</p>
                        </div>
                    )}
                </header>
            )}

            <main className={`w-full max-w-3xl flex-1 relative px-4 pb-12 ${step === "service" ? "pt-8" : "pt-6"}`}>
                {/* ── Progress Stepper ── */}
                {step !== "service" && step !== "success" && (
                    <div className="flex items-center gap-0 mb-8">
                        {(["service", "staff", "time", "checkout"] as const).map((s, i, arr) => {
                            const currentIdx = arr.indexOf(step as typeof arr[number]);
                            const done = i < currentIdx;
                            const active = i === currentIdx;
                            const labels = ["Prestation", "Praticien", "Créneau", "Infos"];
                            return (
                                <React.Fragment key={s}>
                                    {i > 0 && <div className={`flex-1 h-0.5 transition-colors duration-500 mx-1 ${done ? t.bg : "bg-white/10"}`} />}
                                    <div className="flex flex-col items-center gap-1 shrink-0">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${done ? `${t.bg} text-black` :
                                            active ? `${t.bgLight} border-2 ${t.border} ${t.text}` :
                                                "bg-white/5 border-2 border-white/10 text-slate-600"
                                            }`}>{done ? "✓" : i + 1}</div>
                                        <span className={`text-[9px] font-semibold uppercase tracking-wider whitespace-nowrap ${active ? t.text : done ? "text-slate-400" : "text-slate-700"
                                            }`}>{labels[i]}</span>
                                    </div>
                                </React.Fragment>
                            );
                        })}
                    </div>
                )}
                <AnimatePresence mode="wait">
                    {step === "service" && (
                        <motion.div
                            key="services"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="flex flex-col h-full"
                        >
                            {/* Tabs Navigation */}
                            <div className="flex gap-8 border-b border-white/10 mb-8 shrink-0">
                                <button
                                    onClick={() => setActiveTab("prestations")}
                                    className={`w-1/2 py-4 text-center font-medium transition-all ${activeTab === "prestations" ? `text-white border-b-2 ${t.border}` : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"}`}
                                >
                                    Prestations
                                    {activeTab === "prestations" && <motion.div layoutId="tab-indicator" className={`absolute bottom-0 left-0 right-0 h-0.5 ${t.bg}`} />}
                                </button>
                                <button
                                    onClick={() => setActiveTab("enseigne")}
                                    className={`w-1/2 py-4 text-center font-medium transition-all ${activeTab === "enseigne" ? `text-white border-b-2 ${t.border}` : "text-slate-500 hover:text-slate-300 border-b-2 border-transparent"}`}
                                >
                                    L&apos;Enseigne
                                    {activeTab === "enseigne" && <motion.div layoutId="tab-indicator" className={`absolute bottom-0 left-0 right-0 h-0.5 ${t.bg}`} />}
                                </button>
                            </div>

                            {/* Tab Content */}
                            <AnimatePresence mode="wait">
                                {activeTab === "prestations" && (
                                    <motion.div
                                        key="prestations-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-8"
                                    >
                                        {Object.entries(
                                            services.reduce((acc: Record<string, typeof services>, curr: any) => {
                                                const cat = curr.category || "Prestations";
                                                if (!acc[cat]) acc[cat] = [];
                                                acc[cat].push(curr);
                                                return acc;
                                            }, {} as Record<string, typeof services>)
                                        ).map(([categoryName, catServices]) => (
                                            <div key={categoryName}>
                                                <h3 className={`text-xl font-bold mb-4 ${textApp}`}>{categoryName}</h3>
                                                <div className="space-y-3">
                                                    {catServices.map((service) => {
                                                        const isInCart = selectedServices.some(s => s.id === service.id);
                                                        return (
                                                            <button
                                                                key={service.id}
                                                                onClick={() => {
                                                                    if (!isInCart) setSelectedServices(prev => [...prev, service]);
                                                                }}
                                                                className={`w-full text-left p-4 ${radiusBtn} ${isInCart ? `${t.bgLight} border-2 ${t.border}` : bgCard} ${t.hoverBorder} transition-all duration-300 group flex justify-between items-center`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <div>
                                                                        <h3 className={`text-base font-semibold ${textApp}`}>{service.name}</h3>
                                                                        <p className={`text-xs ${textMuted} mt-1 flex items-center gap-1.5 font-medium`}>
                                                                            <Clock className={`w-3.5 h-3.5 ${t.text}`} /> {service.durationMin} min
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="flex items-center gap-3">
                                                                    <span className={`font-bold ${textApp} whitespace-nowrap`}>{service.price}€</span>
                                                                    {isInCart
                                                                        ? <CheckCircle2 className={`w-5 h-5 ${t.text}`} />
                                                                        : <Plus className={`w-5 h-5 ${textMuted} group-hover:${t.text} transition-colors`} />}
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}

                                        {/* Panier */}
                                        {selectedServices.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className={`mt-4 p-4 ${bgCard} border-2 ${t.border} rounded-2xl`}
                                            >
                                                <p className={`text-xs font-bold uppercase tracking-widest ${t.text} mb-3`}>Votre sélection</p>
                                                <div className="space-y-2 mb-4">
                                                    {selectedServices.map((s, i) => (
                                                        <div key={i} className={`flex justify-between items-center py-2 border-b ${borderMuted} last:border-0`}>
                                                            <div>
                                                                <p className={`text-sm font-semibold ${textApp}`}>{s.name}</p>
                                                                <p className={`text-xs ${textMuted}`}>{s.durationMin} min · {s.price}€</p>
                                                            </div>
                                                            <button onClick={() => setSelectedServices(prev => prev.filter((_, idx) => idx !== i))} className="text-red-400 hover:text-red-300 p-1">
                                                                <X className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <p className={`text-xs ${textMuted}`}>Total · {totalDuration} min</p>
                                                        <p className={`font-bold text-xl ${textApp}`}>{totalPrice}€</p>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            if (staffList.length === 1) { setSelectedStaff(staffList[0]); setStep("time"); }
                                                            else { setStep("staff"); }
                                                        }}
                                                        className={`px-6 py-3 ${t.bg} text-black font-bold rounded-xl flex items-center gap-2 text-sm hover:opacity-90 transition-opacity`}
                                                    >
                                                        Continuer <ChevronRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                )}

                                {activeTab === "enseigne" && (
                                    <motion.div
                                        key="enseigne-tab"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-10"
                                    >
                                        {/* Galerie de l'enseigne */}
                                        {salon.images && salon.images.length > 0 && (
                                            <div className="space-y-4">
                                                <div className={`w-full h-[300px] md:h-[400px] ${radiusBtn} overflow-hidden relative border ${borderMuted} group`}>
                                                    <img
                                                        src={salon.images[selectedImageIdx]}
                                                        alt="Intérieur du salon"
                                                        className="w-full h-full object-cover transition-opacity duration-300"
                                                    />
                                                </div>
                                                {salon.images.length > 1 && (
                                                    <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                                        {salon.images.map((img, idx) => (
                                                            <button
                                                                key={idx}
                                                                onClick={() => setSelectedImageIdx(idx)}
                                                                className={`shrink-0 w-24 h-24 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIdx === idx ? `${t.border} opacity-100` : 'border-transparent opacity-50 hover:opacity-100'}`}
                                                            >
                                                                <img src={img} alt={`Salon - vignette ${idx + 1}`} className="w-full h-full object-cover" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div>
                                                <h3 className={`text-2xl font-bold mb-4 ${textApp}`}>À propos</h3>
                                                <p className={`${textMuted} leading-relaxed text-[15px] max-w-2xl text-justify`}>
                                                    {salon.description || "Aucune description de l&apos;enseigne n&apos;a été spécifiée."}
                                                </p>
                                                <div className={`mt-6 w-12 h-1 rounded flex-shrink-0 ${t.bg}`}></div>
                                            </div>
                                            <div className="space-y-6">
                                                <h3 className={`text-2xl font-bold ${textApp}`}>Informations pratiques</h3>

                                                {salon.phone && (
                                                    <div className={`flex items-start gap-4 p-5 ${radiusBtn} ${bgCard} transition-colors`}>
                                                        <div className={`w-12 h-12 rounded-full ${t.bgLight} flex items-center justify-center shrink-0 ${t.borderLight}`}>
                                                            <Phone className={`w-5 h-5 ${t.text}`} />
                                                        </div>
                                                        <div>
                                                            <p className={`text-xs ${textMuted} font-medium mb-1 uppercase tracking-wider`}>Téléphone</p>
                                                            <a href={`tel:${salon.phone}`} className={`text-base font-semibold ${textApp} hover:${t.text} transition-colors whitespace-pre-wrap`}>
                                                                {salon.phone}
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}

                                                {salon.address && (
                                                    <div className={`flex flex-col gap-4 p-5 ${radiusBtn} ${bgCard}`}>
                                                        <div className="flex items-start gap-4">
                                                            <div className={`w-12 h-12 rounded-full ${t.bgLight} flex items-center justify-center shrink-0 ${t.borderLight}`}>
                                                                <MapPin className={`w-5 h-5 ${t.text}`} />
                                                            </div>
                                                            <div>
                                                                <p className={`text-xs ${textMuted} font-medium mb-1 uppercase tracking-wider`}>Adresse</p>
                                                                <p className={`text-base font-semibold ${textApp}`}>
                                                                    {salon.address}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="w-full h-64 md:h-80 rounded-lg overflow-hidden border border-white/10 mt-2 relative">
                                                            <iframe
                                                                width="100%"
                                                                height="100%"
                                                                style={{ border: 0 }}
                                                                allowFullScreen={false}
                                                                loading="lazy"
                                                                src={`https://maps.google.com/maps?q=${encodeURI(salon.address + ", " + salon.name)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                                            ></iframe>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    )}

                    {step === "staff" && (
                        <motion.div
                            key="staff"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <div className="mb-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">Avec qui ?</h2>
                                    <p className="text-slate-400 text-sm">Choisissez votre collaborateur</p>
                                </div>
                                <button onClick={() => setStep("service")} className="text-xs text-slate-500 underline">Retour</button>
                            </div>

                            <div className="space-y-3">
                                <button
                                    onClick={() => {
                                        // Option "N'importe qui": Select randomly or first available. 
                                        // For now, default to first staff or a specific logic if desired.
                                        setSelectedStaff(staffList[0]);
                                        setStep("time");
                                    }}
                                    className={`w-full text-left p-4 ${radiusBtn} ${bgCard} ${t.hoverBorder} transition-all group flex items-center justify-between`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full ${t.bgLight} ${t.text} flex items-center justify-center shrink-0 ${t.borderLight}`}>
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className={`font-medium ${textApp}`}>Sans préférence</h3>
                                            <p className={`text-xs ${textMuted}`}>Le premier disponible</p>
                                        </div>
                                    </div>
                                    <ChevronRight className={`w-5 h-5 text-slate-500 group-hover:${t.text} transition-colors`} />
                                </button>

                                {staffList.map((staff) => (
                                    <button
                                        key={staff.id}
                                        onClick={() => {
                                            setSelectedStaff(staff);
                                            setStep("time");
                                        }}
                                        className={`w-full text-left p-4 ${radiusBtn} ${bgCard} ${t.hoverBorder} transition-all group flex items-center justify-between`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`w-12 h-12 rounded-full ${m.avatarBg} flex items-center justify-center border ${borderMuted} text-xl font-bold ${textMuted}`}>
                                                {staff.name.charAt(0)}
                                            </div>
                                            <div>
                                                <h3 className={`font-medium ${textApp}`}>{staff.name}</h3>
                                                <p className={`text-xs ${textMuted}`}>{staff.role}</p>
                                            </div>
                                        </div>
                                        <ChevronRight className={`w-5 h-5 text-slate-500 group-hover:${t.text} transition-colors`} />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === "time" && (
                        <motion.div
                            key="time"
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                        >
                            <div className="mb-6 flex justify-between items-center">
                                <div>
                                    <h2 className="text-xl font-semibold">{selectedService?.name}</h2>
                                    <p className="text-slate-400 text-sm">Avec <span className={t.text}>{selectedStaff?.name}</span></p>
                                </div>
                                <button onClick={() => setStep(staffList.length > 1 ? "staff" : "service")} className="text-xs text-slate-500 underline">Retour</button>
                            </div>

                            <div className="mb-6">
                                <label className="block text-xs uppercase tracking-widest text-slate-500 mb-3">Choisir une Date</label>
                                <DayStrip
                                    selectedDate={selectedDate}
                                    onChange={(d) => { setSelectedDate(d); setSelectedSlot(null); }}
                                    advanceBookingDays={salon.advanceBookingDays}
                                    t={t}
                                />
                            </div>

                            {loadingSlots ? (
                                <div className="flex justify-center items-center py-10">
                                    <Loader2 className={`w-8 h-8 ${t.text} animate-spin`} />
                                </div>
                            ) : availableSlots.length === 0 ? (
                                <div className={`text-center p-6 ${bgCard} ${radiusBtn} ${textMuted}`}>
                                    Plus aucun créneau disponible pour cette date.
                                </div>
                            ) : (
                                <motion.div
                                    className="grid grid-cols-3 gap-3"
                                    variants={{ show: { transition: { staggerChildren: 0.05 } } }}
                                    initial="hidden"
                                    animate="show"
                                >
                                    {availableSlots.map((slot) => (
                                        <motion.button
                                            key={slot}
                                            variants={{ hidden: { opacity: 0, scale: 0.8, y: 10 }, show: { opacity: 1, scale: 1, y: 0 } }}
                                            onClick={() => {
                                                setSelectedSlot(slot);
                                                setStep("checkout");
                                            }}
                                            className={`py-3 rounded-2xl border-2 text-center font-semibold text-sm transition-all duration-200 ${selectedSlot === slot ? `${t.bg} border-transparent text-black shadow-lg` : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/30"}`}
                                        >
                                            {slot}
                                        </motion.button>
                                    ))}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {step === "checkout" && (
                        <motion.div
                            key="checkout"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl"
                        >
                            <div className="mb-6 pb-4 border-b border-white/10 flex justify-between items-start">
                                <div>
                                    <div className="space-y-1 mb-2">
                                        {selectedServices.map((s, i) => (
                                            <p key={i} className={`font-semibold ${i === 0 ? textApp : textMuted + " text-sm"}`}>
                                                {i > 0 && <span className={`text-xs ${t.text} mr-1`}>+</span>}{s.name}
                                            </p>
                                        ))}
                                    </div>
                                    <p className="text-sm text-slate-400 mt-1 flex gap-2 capitalize">
                                        <Calendar className="w-4 h-4" /> {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })} à {selectedSlot}
                                    </p>
                                    <p className={`text-xs ${t.text} font-semibold mt-1`}>{totalDuration} min · {totalPrice}€</p>
                                </div>
                                <button onClick={() => setStep("time")} className={`text-xs ${t.text}`}>Éditer</button>
                            </div>

                            {error && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 text-sm">
                                    {error}
                                </div>
                            )}

                            <form className="space-y-3" onSubmit={handleBooking}>
                                <div>
                                    <input type="text" placeholder="Prénom Nom" required
                                        value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className={`w-full ${bgCard} border ${borderMuted} rounded-xl p-3.5 ${textApp} placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all`} />
                                </div>
                                <div>
                                    <input type="tel" placeholder="Numéro de Téléphone" required
                                        value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className={`w-full ${bgCard} border ${borderMuted} rounded-xl p-3.5 ${textApp} placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all`} />
                                </div>
                                <div>
                                    <input type="email" placeholder="Email de contact (Optionnel)"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className={`w-full ${bgCard} border ${borderMuted} rounded-xl p-3.5 ${textApp} placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all`} />
                                </div>

                                {salon.depositType && salon.depositType !== "none" && (
                                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl mb-4 text-center">
                                        <p className="text-xs text-slate-400 uppercase tracking-widest mb-1">Acompte à régler</p>
                                        <p className={`text-xl font-bold ${t.text}`}>
                                            {salon.depositType === "fixed"
                                                ? `${salon.depositValue}€`
                                                : `${Math.round((totalPrice * (salon.depositValue || 0)) / 100)}€ (${salon.depositValue}%)`}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-1 italic">
                                            Cet acompte sécurise votre rendez-vous.
                                        </p>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full mt-3 ${t.bg} text-black font-bold rounded-xl p-4 transition-all flex justify-center items-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.99]`}
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <span className="group-hover:scale-105 transition-transform flex items-center gap-2">
                                            {salon.depositType && salon.depositType !== "none" ? (
                                                <>Payer l&apos;acompte <ChevronRight className="w-4 h-4" /></>
                                            ) : (
                                                "Confirmer mon Slot"
                                            )}
                                        </span>
                                    )}
                                </button>
                            </form>
                        </motion.div>
                    )}

                    {step === "success" && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center py-12"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                                className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6"
                            >
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </motion.div>
                            <h2 className="text-2xl font-bold mb-2">Slot Confirmé !</h2>
                            <p className={`${textMuted} mb-8`}>À bientôt pour {selectedServices.map(s => s.name).join(" + ")}.</p>

                            {salon.address && (
                                <div className="mb-6 rounded-xl border border-white/10 overflow-hidden bg-white/5 opacity-80 hover:opacity-100 transition-opacity isolated">
                                    <div className="p-3 bg-black flex items-center justify-center gap-2 border-b border-white/5 text-sm font-medium text-emerald-500">
                                        <MapPin className="w-4 h-4" /> Nous trouver
                                    </div>
                                    <iframe
                                        width="100%"
                                        height="150"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        src={`https://maps.google.com/maps?q=${encodeURI(salon.address + ", " + salon.name)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    ></iframe>
                                    {salon.phone && (
                                        <div className="p-3 bg-black border-t border-white/5 flex justify-center">
                                            <a href={`tel:${salon.phone}`} className="text-xs text-slate-300 font-medium flex items-center gap-2 hover:text-white transition-colors">
                                                <Phone className="w-3 h-3" /> {salon.phone}
                                            </a>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    onClick={handleAddToGoogleCalendar}
                                    className="w-full bg-slate-100 hover:bg-white text-black font-semibold rounded-xl p-4 transition-colors flex items-center justify-center gap-3 group border border-transparent"
                                >
                                    <CalendarPlus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                                    Ajouter à Google Agenda
                                </button>

                                <button
                                    onClick={handleAddToAppleCalendar}
                                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl p-4 transition-colors flex items-center justify-center gap-3 group border border-white/5"
                                >
                                    <CalendarPlus className="w-5 h-5 text-emerald-500 group-hover:scale-110 transition-transform" />
                                    Apple / Outlook (.ics)
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div >
    );
}

export default function BookingFlow(props: Props) {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-white">Chargement...</div>}>
            <BookingFlowContent {...props} />
        </Suspense>
    );
}
