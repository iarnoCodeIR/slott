"use client";

import React, { useState } from "react";
import { Package, Clock, Trash2, Edit3, Plus, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { createService, updateService, deleteService } from "./actions";

type Service = {
    id: string;
    name: string;
    category: string;
    description: string | null;
    durationMin: number;
    bufferTimeMin: number;
    price: number;
};

export default function ServicesManager({ initialServices }: { initialServices: Service[] }) {
    const [services, setServices] = useState<Service[]>(initialServices);
    const [search, setSearch] = useState("");

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);

    // Form states
    const [formData, setFormData] = useState({ name: "", category: "Prestations", description: "", durationMin: 30, bufferTimeMin: 0, price: 20 });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const filteredServices = services.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

    const openCreateModal = () => {
        setEditingService(null);
        setFormData({ name: "", category: "Prestations", description: "", durationMin: 30, bufferTimeMin: 0, price: 20 });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const openEditModal = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            category: service.category || "Prestations",
            description: service.description || "",
            durationMin: service.durationMin,
            bufferTimeMin: service.bufferTimeMin || 0,
            price: service.price
        });
        setErrorMsg("");
        setIsModalOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Voulez-vous vraiment supprimer cette prestation ?")) return;

        setIsLoading(true);
        const res = await deleteService(id);
        if (res.success) {
            setServices(services.filter(s => s.id !== id));
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
            if (editingService) {
                const res = await updateService(editingService.id, formData);
                if (res.success && res.service) {
                    setServices(services.map(s => s.id === editingService.id ? res.service as any as Service : s));
                    setIsModalOpen(false);
                } else {
                    setErrorMsg("Erreur lors de la modification.");
                }
            } else {
                const res = await createService(formData);
                if (res.success && res.service) {
                    setServices([...services, res.service as any as Service].sort((a, b) => a.name.localeCompare(b.name)));
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

    return (
        <div className="w-full">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 pb-6 border-b border-white/5 gap-4 md:gap-0">
                <div>
                    <h1 className="text-4xl font-normal tracking-tight">Prestations</h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
                        Gérez vos services et tarifs ({services.length} total)
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
                    <button
                        onClick={openCreateModal}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all shrink-0"
                    >
                        <Plus className="w-4 h-4" /> Nouvelle Prestation
                    </button>
                </div>
            </header>

            {/* Grille de Prestations */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredServices.map(service => (
                    <div key={service.id} className="bg-white/5 border border-white/10 p-6 flex flex-col justify-between group hover:border-emerald-500/50 hover:bg-white/10 transition-all duration-300">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-medium text-white">{service.name}</h3>
                                    <span className="text-xs font-bold uppercase tracking-widest text-emerald-500 mt-1 block">{service.category || "Prestations"}</span>
                                </div>
                                <div className="text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-sm border border-emerald-500/20 text-sm">
                                    {service.price}€
                                </div>
                            </div>
                            {service.description ? (
                                <p className="text-sm text-slate-400 mb-6 line-clamp-2">{service.description}</p>
                            ) : (
                                <p className="text-sm text-slate-600 italic mb-6">Aucune description.</p>
                            )}

                            <div className="flex flex-wrap items-center gap-2 mb-6">
                                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-slate-500 bg-black/50 px-3 py-1.5 border border-white/5 w-fit">
                                    <Clock className="w-4 h-4 text-emerald-500" /> {service.durationMin} minutes
                                </div>
                                {service.bufferTimeMin > 0 && (
                                    <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded w-fit">
                                        + {service.bufferTimeMin} min pause
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex gap-2 pt-4 border-t border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={() => openEditModal(service)}
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 text-slate-300 text-sm transition-colors border border-white/5"
                            >
                                <Edit3 className="w-4 h-4" /> Éditer
                            </button>
                            <button
                                onClick={() => handleDelete(service.id)}
                                disabled={isLoading}
                                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors border border-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {filteredServices.length === 0 && (
                <div className="bg-black border border-white/5 p-16 flex flex-col items-center justify-center text-center">
                    <Package className="w-16 h-16 text-slate-700 mb-4" />
                    <h2 className="text-xl font-medium text-slate-300 mb-2">Aucune prestation trouvée</h2>
                    <p className="text-slate-500 max-w-sm mb-6">Commencez par ajouter votre premier service détaillé pour que vos clients puissent réserver.</p>
                    <button
                        onClick={openCreateModal}
                        className="px-6 py-3 border border-white/10 text-white text-sm font-semibold hover:bg-white/5 transition-all"
                    >
                        Ajouter un service
                    </button>
                </div>
            )}

            {/* Fenêtre Modale d'Édition / Création */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-[#050505] border border-white/10 w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[90vh]">
                        {/* Header Modal */}
                        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black shrink-0">
                            <h2 className="text-2xl font-bold flex items-center gap-3">
                                <Package className="w-6 h-6 text-emerald-500" />
                                {editingService ? "Modifier la prestation" : "Nouvelle Prestation"}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white p-2">✕</button>
                        </div>

                        {/* Body Modal Scrollable */}
                        <div className="p-8 overflow-y-auto flex-1">
                            {errorMsg && (
                                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 text-red-500 flex items-start gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    {errorMsg}
                                </div>
                            )}

                            <form id="service-form" onSubmit={handleSubmit} className="space-y-8">
                                {/* Nom du service */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Nom de la prestation *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Coupe Homme Premium"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                                    />
                                </div>

                                {/* Catégorie du service */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Catégorie (Onglet)</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.category}
                                        onChange={e => setFormData({ ...formData, category: e.target.value })}
                                        placeholder="Ex: Coiffure Homme, Massages, Onglerie..."
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors text-lg"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Description marketing (Optionnel)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        rows={3}
                                        placeholder="Décrivez ce que le client va vivre (shampooing, soins, finition...)"
                                        className="w-full bg-white/5 border border-white/10 p-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                    />
                                </div>

                                {/* Prix & Durée en deux colonnes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Prix public (€) *</label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">€</span>
                                            <input
                                                type="number"
                                                required min="0" step="0.5"
                                                value={formData.price}
                                                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                                className="w-full bg-white/5 border border-white/10 pl-10 pr-4 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors text-xl font-bold font-mono"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs uppercase tracking-widest font-semibold text-slate-400">Durée du créneau (Min) *</label>
                                        <div className="relative">
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-500 text-sm font-bold tracking-widest">MINUTES</span>
                                            <select
                                                value={formData.durationMin}
                                                onChange={e => setFormData({ ...formData, durationMin: parseInt(e.target.value) })}
                                                className="w-full bg-white/5 border border-white/10 pl-4 pr-24 py-4 text-white focus:outline-none focus:border-emerald-500 transition-colors text-xl font-bold font-mono appearance-none cursor-pointer"
                                            >
                                                <option value={10} className="bg-black text-white">10</option>
                                                <option value={15} className="bg-black text-white">15 (Rapide)</option>
                                                <option value={20} className="bg-black text-white">20</option>
                                                <option value={25} className="bg-black text-white">25</option>
                                                <option value={30} className="bg-black text-white">30 (Standard)</option>
                                                <option value={35} className="bg-black text-white">35</option>
                                                <option value={40} className="bg-black text-white">40</option>
                                                <option value={45} className="bg-black text-white">45</option>
                                                <option value={50} className="bg-black text-white">50</option>
                                                <option value={60} className="bg-black text-white">60 (1 heure)</option>
                                                <option value={75} className="bg-black text-white">75 (1h15)</option>
                                                <option value={90} className="bg-black text-white">90 (1h30)</option>
                                                <option value={120} className="bg-black text-white">120 (2 heures)</option>
                                                <option value={135} className="bg-black text-white">135 (2h15)</option>
                                                <option value={150} className="bg-black text-white">150 (2h30)</option>
                                                <option value={165} className="bg-black text-white">165 (2h45)</option>
                                                <option value={180} className="bg-black text-white">180 (3 heures)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2 col-span-1 md:col-span-2 mt-2">
                                        <label className="text-xs uppercase tracking-widest font-semibold text-orange-400 flex items-center gap-2">
                                            Temps de battement (Optionnel)
                                        </label>
                                        <p className="text-[11px] text-slate-500 mb-2 leading-relaxed">
                                            Temps bloqué automatiquement *après* le rendez-vous pour nettoyer, préparer, etc.<br />
                                            <span className="text-orange-500/80 mt-2 block p-2 bg-orange-500/10 rounded border border-orange-500/20">
                                                <strong>⚠️ Attention :</strong> Ce temps supplémentaire peut bloquer le créneau précédent.<br />
                                                Exemple : Une coupe de 30 min + 5 min de pause prend 35 min en réalité. Si vous avez déjà un rendez-vous réservé à 9h30, la place de 9h00 deviendra indisponible pour cette coupe de 35 min, car elle chevaucherait le rendez-vous de 9h30.
                                            </span>
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                            {[0, 5, 10, 15, 30].map(min => (
                                                <button
                                                    key={min}
                                                    type="button"
                                                    onClick={() => setFormData({ ...formData, bufferTimeMin: min })}
                                                    className={`px-4 py-2 rounded text-sm font-bold transition-all border ${formData.bufferTimeMin === min
                                                        ? "bg-orange-500/20 text-orange-400 border-orange-500/50"
                                                        : "bg-white/5 text-slate-400 border-white/10 hover:bg-white/10"
                                                        }`}
                                                >
                                                    {min === 0 ? "Aucun" : `+ ${min} min`}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
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
                                form="service-form"
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
