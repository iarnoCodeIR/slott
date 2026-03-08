"use client";

import React, { useState } from "react";
import { Users, Trash2, Edit3, Plus, Search, CheckCircle2, AlertCircle, UserCircle, Clock, CalendarX } from "lucide-react";
import { createStaff, updateStaff, deleteStaff, updateStaffHours } from "./actions";

type Staff = {
    id: string;
    name: string;
    role: string | null;
    workingHours?: any;
};

export default function StaffManager({ initialStaff }: { initialStaff: Staff[] }) {
    const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
    const [search, setSearch] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
    const [modalTab, setModalTab] = useState<"fixed" | "even" | "odd">("fixed");
    const [mainTab, setMainTab] = useState<"routine" | "exceptions">("routine");

    // Form states
    const [formData, setFormData] = useState({ name: "", role: "" });
    const [hoursData, setHoursData] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const filteredStaff = staffList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    const openCreateModal = () => {
        setEditingStaff(null);
        setFormData({ name: "", role: "Coiffeur" });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const openEditModal = (staff: Staff) => {
        setEditingStaff(staff);
        setFormData({
            name: staff.name,
            role: staff.role || ""
        });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const defaultHours = {
        "1": { active: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
        "2": { active: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
        "3": { active: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
        "4": { active: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
        "5": { active: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
        "6": { active: true, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] },
        "0": { active: false, slots: [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }] }
    };

    const openHoursModal = (staff: Staff) => {
        setEditingStaff(staff);

        // Structure par défaut : on englobe dans un objet { type: "fixed", schedule: ... }
        let parsedHours = { type: "fixed", schedule: JSON.parse(JSON.stringify(defaultHours)), exceptions: [] };

        if (staff.workingHours) {
            try {
                let parsed = typeof staff.workingHours === 'string' ? JSON.parse(staff.workingHours) : staff.workingHours;

                if (parsed.type) {
                    // Structure moderne déjà présente
                    parsedHours = { ...parsed, exceptions: parsed.exceptions || [] };
                } else {
                    // C'est l'ancienne structure (juste un objet de jours)
                    for (let day in parsed) {
                        if (parsed[day].start) {
                            parsed[day].slots = [{ start: parsed[day].start, end: parsed[day].end }];
                            delete parsed[day].start;
                            delete parsed[day].end;
                        }
                    }
                    parsedHours = { type: "fixed", schedule: parsed, exceptions: [] };
                }
            } catch (e) {
                console.error("Error parsing hours");
            }
        }
        setHoursData(parsedHours);
        setModalTab(parsedHours.type === "alternating" ? "even" : "fixed");
        setMainTab("routine");
        setErrorMsg("");
        setIsHoursModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer ce membre de l'équipe ?")) return;

        setIsLoading(true);
        const res = await deleteStaff(id);
        if (res.success) {
            setStaffList(staffList.filter(s => s.id !== id));
        } else {
            alert(res.error);
        }
        setIsLoading(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMsg("");

        try {
            if (editingStaff) {
                const res = await updateStaff(editingStaff.id, formData);
                if (res.success && res.staff) {
                    setStaffList(staffList.map(s => s.id === editingStaff.id ? res.staff : s));
                    setIsModalOpen(false);
                } else {
                    setErrorMsg("Erreur lors de la modification.");
                }
            } else {
                const res = await createStaff(formData);
                if (res.success && res.staff) {
                    setStaffList([...staffList, res.staff].sort((a, b) => a.name.localeCompare(b.name)));
                    setIsModalOpen(false);
                } else {
                    setErrorMsg("Erreur lors de la création.");
                }
            }
        } catch (e) {
            setErrorMsg("Une erreur réseau est survenue.");
        }
        setIsLoading(false);
    };

    const handleHoursSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStaff) return;
        setIsLoading(true);
        setErrorMsg("");

        try {
            const res = await updateStaffHours(editingStaff.id, hoursData);
            if (res.success && res.staff) {
                setStaffList(staffList.map(s => s.id === editingStaff.id ? res.staff : s));
                setIsHoursModalOpen(false);
            } else {
                setErrorMsg("Erreur lors de la mise à jour des horaires.");
            }
        } catch (e) {
            setErrorMsg("Une erreur réseau est survenue.");
        }
        setIsLoading(false);
    };

    const updateDaySchedule = (day: string, updatedDayData: any) => {
        if (!hoursData) return;

        if (hoursData.type === "fixed") {
            setHoursData({ ...hoursData, schedule: { ...hoursData.schedule, [day]: updatedDayData } });
        } else if (modalTab === "even") {
            setHoursData({ ...hoursData, scheduleEven: { ...hoursData.scheduleEven, [day]: updatedDayData } });
        } else {
            setHoursData({ ...hoursData, scheduleOdd: { ...hoursData.scheduleOdd, [day]: updatedDayData } });
        }
    };

    // Raccourci pour lire le planning actuel selon l'onglet
    const currentSchedule = hoursData?.type === "fixed" ? hoursData?.schedule : (modalTab === "even" ? hoursData?.scheduleEven : hoursData?.scheduleOdd);

    return (
        <div className="w-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-white/5 gap-4 md:gap-0">
                <div>
                    <h1 className="text-4xl font-normal tracking-tight">L'Équipe</h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
                        Gérez vos collaborateurs ({staffList.length} total)
                    </p>
                </div>
                <div className="flex gap-4 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-slate-50 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-sm"
                        />
                    </div>
                    {/* Mode Solo Toggle */}
                    <div
                        className={`flex items-center gap-2 border border-white/10 px-4 py-2.5 rounded-lg bg-black shrink-0 ${staffList.length > 1 ? 'opacity-70' : ''}`}
                        onClick={(e) => {
                            if (staffList.length > 1) {
                                alert("❌ Action impossible :\nVous avez actuellement plusieurs collaborateurs dans l'équipe. Pour activer le mode solo, veuillez ne garder qu'un seul membre.");
                            } else if (staffList.length === 0) {
                                alert("Veuillez d'abord ajouter un collaborateur (vous-même).");
                            } else {
                                alert("✅ Mode Solo actif !\nLes clients n'auront pas à choisir de collaborateur lors de leur réservation.");
                            }
                        }}
                    >
                        <input
                            type="checkbox"
                            readOnly
                            checked={staffList.length === 1}
                            className={`accent-emerald-500 w-4 h-4 ${staffList.length > 1 ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                        />
                        <label className={`text-sm font-medium tracking-wide ${staffList.length > 1 ? 'text-slate-500 cursor-not-allowed' : 'text-slate-300 cursor-pointer'}`}>
                            Je travaille seul
                        </label>
                    </div>
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Nouveau Staff
                    </button>
                </div>
            </header>

            {/* Grille de Staff */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredStaff.map(staff => (
                    <div key={staff.id} className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between group hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-white/10 flex items-center justify-center shrink-0">
                                <UserCircle className="w-10 h-10 text-slate-400" />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium text-white">{staff.name}</h3>
                                <div className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20 text-[10px] uppercase tracking-widest mt-1 w-fit">
                                    {staff.role || "Employé"}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openHoursModal(staff)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-emerald-500 hover:text-black text-slate-300 text-sm transition-colors border border-white/5"
                            >
                                <Clock className="w-4 h-4" /> Horaires
                            </button>
                            <button
                                onClick={() => openEditModal(staff)}
                                className="px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 transition-colors border border-white/5"
                                title="Modifier le profil"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(staff.id)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20"
                                title="Supprimer"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredStaff.length === 0 && (
                <div className="bg-black border border-white/5 p-16 flex flex-col items-center justify-center text-center">
                    <Users className="w-16 h-16 text-slate-700 mb-4" />
                    <h2 className="text-xl font-medium text-slate-300 mb-2">Aucun membre d'équipe trouvé</h2>
                    <p className="text-slate-500 max-w-sm mb-6">Ajoutez les membres de votre salon pour pouvoir leur assigner des rendez-vous.</p>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all"
                    >
                        Ajouter un collaborateur
                    </button>
                </div>
            )}

            {/* Fenêtre Modale d'Édition / Création */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-lg shadow-2xl relative flex flex-col">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black shrink-0">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Users className="w-6 h-6 text-emerald-500" />
                                {editingStaff ? "Modifier le staff" : "Nouveau Staff"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2">✕</button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-8">
                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 flex items-start gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            <form id="staff-form" onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Prénom & Nom *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Jean Dupont"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Rôle / Spécialité</label>
                                    <input
                                        type="text"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                        placeholder="Ex: Barber Senior, Manager..."
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors"
                                    />
                                </div>
                            </form>
                        </div>

                        {/* Footer Modal */}
                        <div className="p-6 border-t border-white/5 bg-black shrink-0 flex justify-end gap-3">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-6 py-3 border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                form="staff-form"
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? "Sauvegarde..." : <><CheckCircle2 className="w-5 h-5" /> Enregistrer</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fenêtre Modale d'Édition des Horaires */}
            {isHoursModalOpen && hoursData && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black shrink-0">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Clock className="w-6 h-6 text-emerald-500" />
                                Horaires de {editingStaff?.name}
                            </h2>
                            <button onClick={() => setIsHoursModalOpen(false)} className="text-slate-500 hover:text-white p-2">✕</button>
                        </div>

                        {/* Body Modal */}
                        <div className="p-8 overflow-y-auto">
                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 flex items-start gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            {/* Tabs pour basculer Routine vs Congés */}
                            <div className="flex gap-4 border-b border-white/5 pb-4 mb-8">
                                <button type="button" onClick={() => setMainTab("routine")} className={`pb-4 -mb-[18px] border-b-2 font-medium ${mainTab === "routine" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-400 hover:text-white transition-colors"}`}>
                                    Horaires Réguliers
                                </button>
                                <button type="button" onClick={() => setMainTab("exceptions")} className={`pb-4 -mb-[18px] border-b-2 font-medium flex items-center gap-2 ${mainTab === "exceptions" ? "border-emerald-500 text-emerald-500" : "border-transparent text-slate-400 hover:text-white transition-colors"}`}>
                                    <CalendarX className="w-4 h-4" /> Congés & Exceptions
                                </button>
                            </div>

                            {mainTab === "routine" && (
                                <>
                                    <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4 mb-6 border-b border-white/5 pb-6">
                                        <div>
                                            <h3 className="text-white font-medium">Type de Roulement</h3>
                                            <p className="text-slate-400 text-sm">Définissez si les horaires sont fixes ou s'ils alternent selon les semaines (Semaine 1 / Semaine 2).</p>
                                        </div>
                                        <select
                                            className="bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-emerald-500 outline-none text-sm w-full md:w-auto shrink-0"
                                            value={hoursData.type}
                                            onChange={(e) => {
                                                if (e.target.value === "alternating" && hoursData.type !== "alternating") {
                                                    setHoursData({
                                                        type: "alternating",
                                                        scheduleEven: hoursData.schedule || JSON.parse(JSON.stringify(defaultHours)),
                                                        scheduleOdd: hoursData.schedule || JSON.parse(JSON.stringify(defaultHours))
                                                    });
                                                    setModalTab("even");
                                                } else if (e.target.value === "fixed" && hoursData.type !== "fixed") {
                                                    setHoursData({
                                                        type: "fixed",
                                                        schedule: hoursData.scheduleEven || JSON.parse(JSON.stringify(defaultHours))
                                                    });
                                                    setModalTab("fixed");
                                                }
                                            }}
                                        >
                                            <option value="fixed">Classique (Toutes les semaines)</option>
                                            <option value="alternating">Alterné (Semaine 1 / Semaine 2)</option>
                                        </select>
                                    </div>

                                    {hoursData.type === "alternating" && (
                                        <div className="flex gap-2 mb-6">
                                            <button
                                                type="button"
                                                onClick={() => setModalTab("even")}
                                                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors border ${modalTab === "even" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                                            >
                                                📅 Semaine 1
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setModalTab("odd")}
                                                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors border ${modalTab === "odd" ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-500" : "bg-white/5 border-white/10 text-slate-400 hover:text-white"}`}
                                            >
                                                📅 Semaine 2
                                            </button>
                                        </div>
                                    )}

                                    <form id="hours-form" onSubmit={handleHoursSubmit} className="space-y-4">
                                        {[
                                            { day: "1", label: "Lundi" },
                                            { day: "2", label: "Mardi" },
                                            { day: "3", label: "Mercredi" },
                                            { day: "4", label: "Jeudi" },
                                            { day: "5", label: "Vendredi" },
                                            { day: "6", label: "Samedi" },
                                            { day: "0", label: "Dimanche" }
                                        ].map((d) => (
                                            <div key={d.day} className={`flex flex-col sm:flex-row sm:items-start gap-4 p-4 border rounded-xl transition-colors ${currentSchedule?.[d.day]?.active ? "border-emerald-500/30 bg-emerald-500/5" : "border-white/5 bg-white/5 opacity-50"}`}>
                                                <div className="flex items-center gap-3 w-32 shrink-0 pt-2">
                                                    <input
                                                        type="checkbox"
                                                        checked={currentSchedule?.[d.day]?.active || false}
                                                        onChange={(e) => updateDaySchedule(d.day, { ...currentSchedule?.[d.day], active: e.target.checked })}
                                                        className="accent-emerald-500 w-4 h-4 cursor-pointer"
                                                    />
                                                    <span className="font-medium text-white">{d.label}</span>
                                                </div>

                                                <div className="flex flex-col gap-2 flex-1">
                                                    {(currentSchedule?.[d.day]?.slots || [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }]).map((slot: any, index: number) => (
                                                        <div key={index} className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
                                                            <div className="text-[10px] text-slate-500 font-bold uppercase w-12 shrink-0">{index === 0 ? "Matin" : "Aprem"}</div>
                                                            <input
                                                                type="time"
                                                                disabled={!currentSchedule?.[d.day]?.active}
                                                                value={slot.start}
                                                                onChange={(e) => {
                                                                    const newSlots = [...(currentSchedule?.[d.day]?.slots || [])];
                                                                    newSlots[index] = { ...newSlots[index], start: e.target.value };
                                                                    updateDaySchedule(d.day, { ...currentSchedule?.[d.day], slots: newSlots });
                                                                }}
                                                                className="bg-black border border-white/10 px-3 py-2 rounded-md text-sm text-white focus:border-emerald-500 outline-none disabled:opacity-50 flex-1 min-w-[100px]"
                                                            />
                                                            <span className="text-slate-500 hidden sm:block">à</span>
                                                            <input
                                                                type="time"
                                                                disabled={!currentSchedule?.[d.day]?.active}
                                                                value={slot.end}
                                                                onChange={(e) => {
                                                                    const newSlots = [...(currentSchedule?.[d.day]?.slots || [])];
                                                                    newSlots[index] = { ...newSlots[index], end: e.target.value };
                                                                    updateDaySchedule(d.day, { ...currentSchedule?.[d.day], slots: newSlots });
                                                                }}
                                                                className="bg-black border border-white/10 px-3 py-2 rounded-md text-sm text-white focus:border-emerald-500 outline-none disabled:opacity-50 flex-1 min-w-[100px]"
                                                            />
                                                            {index === 1 && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        const newSlots = [...(currentSchedule?.[d.day]?.slots || [])];
                                                                        newSlots.pop();
                                                                        updateDaySchedule(d.day, { ...currentSchedule?.[d.day], slots: newSlots });
                                                                    }}
                                                                    disabled={!currentSchedule?.[d.day]?.active}
                                                                    className="p-2 text-slate-500 hover:text-red-500 transition-colors disabled:opacity-0"
                                                                    title="Supprimer la pause repas (journée continue)"
                                                                >
                                                                    ✕
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}

                                                    {/* Bouton pour ajouter un deuxième créneau s'il a été supprimé */}
                                                    {currentSchedule?.[d.day]?.slots?.length === 1 && currentSchedule?.[d.day]?.active && (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newSlots = [...currentSchedule[d.day].slots, { start: "14:00", end: "18:00" }];
                                                                updateDaySchedule(d.day, { ...currentSchedule[d.day], slots: newSlots });
                                                            }}
                                                            className="text-xs text-emerald-500 hover:text-emerald-400 font-medium self-start mt-1 flex items-center gap-1"
                                                        >
                                                            <Plus className="w-3 h-3" /> Ajouter pause repas
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </form>
                                </>
                            )}

                            {mainTab === "exceptions" && (
                                <div className="space-y-6">
                                    <p className="text-slate-400 text-sm">
                                        Bloquez des dates entières pour définir les congés ou modifiez ponctuellement les horaires d'une journée.
                                    </p>

                                    <div className="space-y-3">
                                        {(hoursData.exceptions || []).length === 0 && (
                                            <div className="text-center p-8 bg-white/5 border border-white/10 rounded-xl">
                                                <p className="text-slate-500">Aucune exception prévue.</p>
                                            </div>
                                        )}
                                        {(hoursData.exceptions || []).map((exc: any, i: number) => (
                                            <div key={i} className="flex flex-col gap-4 p-4 border border-white/10 rounded-xl bg-white/5">
                                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                                    <input type="date" value={exc.date} onChange={e => {
                                                        const newExc = [...hoursData.exceptions];
                                                        newExc[i].date = e.target.value;
                                                        setHoursData({ ...hoursData, exceptions: newExc });
                                                    }} className="bg-black border border-white/10 p-3 rounded text-white text-sm focus:border-emerald-500 outline-none w-full sm:w-auto" />

                                                    <select value={exc.type} onChange={e => {
                                                        const newExc = [...hoursData.exceptions];
                                                        newExc[i].type = e.target.value;
                                                        if (e.target.value === "custom" && !newExc[i].slots) {
                                                            newExc[i].slots = [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }];
                                                        }
                                                        setHoursData({ ...hoursData, exceptions: newExc });
                                                    }} className="bg-black border border-white/10 p-3 rounded text-white text-sm focus:border-emerald-500 outline-none w-full sm:w-auto flex-1">
                                                        <option value="conge">🏖️ En Congé / Absent</option>
                                                        <option value="custom">⏱️ Horaires Exceptionnels</option>
                                                    </select>

                                                    <button type="button" onClick={() => {
                                                        const newExc = [...hoursData.exceptions];
                                                        newExc.splice(i, 1);
                                                        setHoursData({ ...hoursData, exceptions: newExc });
                                                    }} className="text-red-500 p-3 hover:bg-red-500/10 rounded transition-colors w-full sm:w-auto text-center font-bold">✕ Supprimer</button>
                                                </div>

                                                {/* Editing Custom Time Slots */}
                                                {exc.type === "custom" && (
                                                    <div className="flex flex-col gap-2 pt-2 border-t border-white/5 mt-2">
                                                        {(exc.slots || [{ start: "09:00", end: "12:00" }, { start: "14:00", end: "18:00" }]).map((slot: any, slotIdx: number) => (
                                                            <div key={slotIdx} className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full">
                                                                <div className="text-[10px] text-slate-500 font-bold uppercase w-12 shrink-0">{slotIdx === 0 ? "Matin" : "Aprem"}</div>
                                                                <input
                                                                    type="time"
                                                                    value={slot.start}
                                                                    onChange={(e) => {
                                                                        const newExc = [...hoursData.exceptions];
                                                                        newExc[i].slots[slotIdx].start = e.target.value;
                                                                        setHoursData({ ...hoursData, exceptions: newExc });
                                                                    }}
                                                                    className="bg-black border border-white/10 px-3 py-2 rounded-md text-sm text-white focus:border-emerald-500 outline-none flex-1 min-w-[100px]"
                                                                />
                                                                <span className="text-slate-500 hidden sm:block">à</span>
                                                                <input
                                                                    type="time"
                                                                    value={slot.end}
                                                                    onChange={(e) => {
                                                                        const newExc = [...hoursData.exceptions];
                                                                        newExc[i].slots[slotIdx].end = e.target.value;
                                                                        setHoursData({ ...hoursData, exceptions: newExc });
                                                                    }}
                                                                    className="bg-black border border-white/10 px-3 py-2 rounded-md text-sm text-white focus:border-emerald-500 outline-none flex-1 min-w-[100px]"
                                                                />
                                                                {slotIdx === 1 && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            const newExc = [...hoursData.exceptions];
                                                                            newExc[i].slots.pop();
                                                                            setHoursData({ ...hoursData, exceptions: newExc });
                                                                        }}
                                                                        className="p-2 text-slate-500 hover:text-red-500 transition-colors"
                                                                        title="Supprimer la pause repas (journée continue)"
                                                                    >
                                                                        ✕
                                                                    </button>
                                                                )}
                                                            </div>
                                                        ))}

                                                        {/* Adding break for Custom Slots */}
                                                        {exc.slots?.length === 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newExc = [...hoursData.exceptions];
                                                                    newExc[i].slots.push({ start: "14:00", end: "18:00" });
                                                                    setHoursData({ ...hoursData, exceptions: newExc });
                                                                }}
                                                                className="text-xs text-emerald-500 hover:text-emerald-400 font-medium self-start mt-1 flex items-center gap-1"
                                                            >
                                                                <Plus className="w-3 h-3" /> Ajouter pause repas
                                                            </button>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <button type="button" onClick={() => {
                                        setHoursData({
                                            ...hoursData,
                                            exceptions: [...(hoursData.exceptions || []), { date: new Date().toISOString().split('T')[0], type: "conge" }]
                                        });
                                    }} className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 font-medium text-sm p-3 border border-emerald-500/30 bg-emerald-500/10 rounded-lg w-full justify-center transition-colors">
                                        <Plus className="w-4 h-4" /> Ajouter une exception
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer Modal */}
                        <div className="p-6 border-t border-white/5 bg-black shrink-0 flex justify-end gap-3">
                            <button
                                onClick={() => setIsHoursModalOpen(false)}
                                className="px-6 py-3 border border-white/10 text-white font-medium hover:bg-white/5 transition-colors"
                            >
                                Annuler
                            </button>
                            <button
                                form="hours-form"
                                type="submit"
                                disabled={isLoading}
                                className="px-8 py-3 bg-emerald-500 text-black font-bold hover:bg-emerald-400 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {isLoading ? "Sauvegarde..." : <><CheckCircle2 className="w-5 h-5" /> Enregistrer</>}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
