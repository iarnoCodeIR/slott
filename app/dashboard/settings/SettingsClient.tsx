"use client";

import React, { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle, Trash2, Plus, Copy, Link2, ExternalLink, QrCode, Printer, RotateCw, Loader2, CreditCard } from "lucide-react";
import { updateSalonSettings, createStripeConnectAccount, getStripeOnboardingLink, checkStripeConnection } from "./actions";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";

export default function SettingsClient({ salon }: { salon: any }) {
    const [name, setName] = useState(salon?.name || "");
    const [phone, setPhone] = useState(salon?.phone || "");
    const [address, setAddress] = useState(salon?.address || "");
    const [description, setDescription] = useState(salon?.description || "");
    const [images, setImages] = useState<string[]>(salon?.images || []);
    const [logo, setLogo] = useState<string | null>(salon?.logo || null);
    const [heroImage, setHeroImage] = useState<string | null>(salon?.heroImage || null);
    const [theme, setTheme] = useState(salon?.theme || "emerald");
    const [font, setFont] = useState(salon?.font || "inter");
    const [borderRadius, setBorderRadius] = useState(salon?.borderRadius || "smooth");
    const [mode, setMode] = useState(salon?.mode || "dark");
    const [advanceBookingDays, setAdvanceBookingDays] = useState(salon?.advanceBookingDays || 0);
    const [depositType, setDepositType] = useState(salon?.depositType || "none");
    const [depositValue, setDepositValue] = useState(salon?.depositValue || 0);
    const [isUploading, setIsUploading] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [copied, setCopied] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const checkStatus = async () => {
            if (searchParams.get("stripe") === "success" && !salon.stripeConnected) {
                setIsChecking(true);
                await checkStripeConnection(salon.id);
                setIsChecking(false);
            }
        };
        checkStatus();
    }, [searchParams, salon.id, salon.stripeConnected]);

    const handleConnectStripe = async () => {
        setIsConnecting(true);
        try {
            const res = await createStripeConnectAccount(salon.id);
            if (res.success) {
                const linkRes = await getStripeOnboardingLink(salon.id);
                if (linkRes.success && linkRes.url) {
                    window.location.href = linkRes.url;
                } else {
                    alert(linkRes.error || "Erreur lors de la génération du lien Stripe");
                }
            } else {
                alert(res.error || "Erreur lors de la création du compte Stripe");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsConnecting(false);
        }
    };

    const salonSlug = salon?.slug || "mon-salon";
    const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
    const bookingUrl = `${baseUrl}/book/${salonSlug}`;


    const handleCopy = () => {
        navigator.clipboard.writeText(bookingUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handlePrintQR = () => {
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(bookingUrl)}`;
        const win = window.open("", "_blank");
        if (!win) return;
        win.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>QR Code - ${name}</title>
                <style>
                    * { margin: 0; padding: 0; box-sizing: border-box; }
                    body { font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; background: white; padding: 40px; text-align: center; }
                    h1 { font-size: 28px; font-weight: 800; margin-bottom: 8px; letter-spacing: -0.5px; }
                    p { font-size: 13px; color: #666; margin-bottom: 24px; }
                    img { border: 2px solid #f0f0f0; border-radius: 16px; padding: 12px; }
                    .url { margin-top: 20px; font-size: 11px; color: #999; font-family: monospace; }
                    .brand { margin-top: 32px; font-size: 10px; color: #ccc; letter-spacing: 4px; text-transform: uppercase; }
                    @media print { body { padding: 20mm; } }
                </style>
            </head>
            <body>
                <h1>${name}</h1>
                <p>Scannez pour réserver en ligne</p>
                <img src="${qrUrl}" width="240" height="240" />
                <div class="url">${bookingUrl}</div>
                <div class="brand">Propulsé par SLOTT</div>
                <script>window.onload = () => { window.print(); }<\/script>
            </body>
            </html>
        `);
        win.document.close();
    };

    const availableThemes = [
        { id: "emerald", name: "Émeraude", color: "bg-emerald-500" },
        { id: "blue", name: "Océan", color: "bg-blue-500" },
        { id: "violet", name: "Royal", color: "bg-violet-500" },
        { id: "rose", name: "Poudré", color: "bg-rose-500" },
        { id: "amber", name: "Ambre", color: "bg-amber-500" },
        { id: "slate", name: "Gris", color: "bg-slate-500" },
        { id: "red", name: "Rubis", color: "bg-red-500" },
        { id: "orange", name: "Pop", color: "bg-orange-500" },
        { id: "lime", name: "Citron", color: "bg-lime-500" },
        { id: "cyan", name: "Cyan", color: "bg-cyan-500" },
        { id: "fuchsia", name: "Fuchsia", color: "bg-fuchsia-500" },
        { id: "indigo", name: "Indigo", color: "bg-indigo-500" },
    ];

    const availableFonts = [
        { id: "inter", name: "Moderne (Inter)", style: "font-sans" },
        { id: "playfair", name: "Luxe (Playfair)", style: "font-serif" },
        { id: "nunito", name: "Doux (Nunito)", style: "font-sans" },
        { id: "teko", name: "Brutal (Teko)", style: "font-sans uppercase" },
        { id: "mono", name: "Tech (Mono)", style: "font-mono" },
    ];

    const availableRadiuses = [
        { id: "sharp", name: "Carré", css: "rounded-none" },
        { id: "smooth", name: "Arrondi", css: "rounded-lg" },
        { id: "rounded", name: "Pilule", css: "rounded-full" },
    ];

    const availableModes = [
        { id: "dark", name: "Sombre", bg: "bg-[#050505] text-white" },
        { id: "light", name: "Clair", bg: "bg-white text-black border border-slate-200" },
        { id: "cream", name: "Crème", bg: "bg-[#FDFBF7] text-[#4A4036] border border-[#E8E0D5]" },
        { id: "espresso", name: "Espresso", bg: "bg-[#2C1E16] text-[#E8E0D5]" },
        { id: "navy", name: "Navy", bg: "bg-[#0A1128] text-[#F4F7FB]" },
        { id: "midnight", name: "Minuit", bg: "bg-[#0F0A1F] text-[#EBE8F4]" },
    ];

    const availableHeroImages = [
        { id: "none", name: "Aucune", url: null },
        // Coiffure & Barber
        { id: "barber", name: "Barbier", url: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=1600&q=80" },
        { id: "brushing", name: "Coiffage", url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?auto=format&fit=crop&w=1600&q=80" },
        { id: "tools", name: "Ciseaux", url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80" },
        { id: "salon", name: "Lumières", url: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80" },
        { id: "mirror", name: "Intérieur", url: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?auto=format&fit=crop&w=1600&q=80" },
        { id: "chic", name: "Épuré", url: "https://images.unsplash.com/photo-1600607688969-a5bfcd646154?auto=format&fit=crop&w=1600&q=80" },
        // Beauté & Bien-être
        { id: "spa", name: "Spa", url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&w=1600&q=80" },
        { id: "beauty", name: "Beauté", url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=1600&q=80" },
        { id: "nails", name: "Ongles", url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=1600&q=80" },
        { id: "massage", name: "Massage", url: "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=1600&q=80" },
        { id: "zen", name: "Zen", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80" },
        // Nature & Ambiance
        { id: "nature", name: "Plantes", url: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?auto=format&fit=crop&w=1600&q=80" },
        { id: "cerisier", name: "Cerisiers", url: "https://images.unsplash.com/photo-1522383225653-ed111181a951?auto=format&fit=crop&w=1600&q=80" },
        { id: "peony", name: "Fleurs Roses", url: "https://images.unsplash.com/photo-1455659817273-f96807779a8a?auto=format&fit=crop&w=1600&q=80" },
        { id: "ocean", name: "Océan", url: "https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&fit=crop&w=1600&q=80" },
        { id: "sunset", name: "Coucher de soleil", url: "https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=1600&q=80" },
        { id: "tropical", name: "Tropical", url: "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1600&q=80" },
        // Textures & Design
        { id: "marble", name: "Marbre", url: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=1600&q=80" },
        { id: "gradient", name: "Dégradé", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1600&q=80" },
        { id: "dark", name: "Sombre", url: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1600&q=80" },
        { id: "space", name: "Studio", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80" },
    ];

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const newImages: string[] = [];

        for (const file of files) {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error: uploadError } = await supabase.storage
                .from('salon-images')
                .upload(fileName, file);

            if (uploadError) {
                console.error("Erreur d'upload:", uploadError);
                continue;
            }

            const { data } = supabase.storage.from('salon-images').getPublicUrl(fileName);
            newImages.push(data.publicUrl);
        }

        setImages(prev => [...prev, ...newImages]);
        setIsUploading(false);
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        setIsUploading(true);
        const file = files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `logo-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('salon-images')
            .upload(fileName, file);

        if (!uploadError) {
            const { data } = supabase.storage.from('salon-images').getPublicUrl(fileName);
            setLogo(data.publicUrl);
        } else {
            console.error("Erreur d'upload logo:", uploadError);
        }
        setIsUploading(false);
    };

    const [isLoading, setIsLoading] = useState(false);
    const [msg, setMsg] = useState({ type: "", text: "" });

    const handleSave = async () => {
        if (!salon) return;
        setIsLoading(true);
        setMsg({ type: "", text: "" });

        const res = await updateSalonSettings(salon.id, {
            name,
            phone,
            address,
            description,
            images,
            advanceBookingDays,
            theme,
            logo,
            heroImage,
            font,
            borderRadius,
            mode,
            depositType,
            depositValue: Number(depositValue) || 0
        });

        if (res.success) {
            setMsg({ type: "success", text: "Paramètres sauvegardés avec succès." });
        } else {
            setMsg({ type: "error", text: res.error || "Erreur de sauvegarde." });
        }

        setIsLoading(false);
        setTimeout(() => setMsg({ type: "", text: "" }), 5000);
    };

    return (
        <div className="p-10 font-sans w-full max-w-5xl mx-auto">
            <header className="flex justify-between items-end mb-10 pb-6 border-b border-white/5">
                <div>
                    <h1 className="text-4xl font-normal tracking-tight">Paramètres</h1>
                    <p className="text-slate-400 mt-2 text-sm uppercase tracking-widest">
                        Configurez les règles de votre salon
                    </p>
                </div>
                <div>
                    <button
                        onClick={handleSave}
                        disabled={isLoading}
                        className="px-5 py-2.5 bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 hover:drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                        {isLoading ? "Enregistrement..." : <><CheckCircle2 className="w-4 h-4" /> Enregistrer</>}
                    </button>
                </div>
            </header>

            {msg.text && (
                <div className={`mb-6 p-4 border flex items-center gap-3 text-sm rounded ${msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-500"}`}>
                    {msg.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    {msg.text}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Bloc Profil du Salon */}
                <div className="bg-black border border-white/5 p-8 rounded-xl md:col-span-2">
                    <h2 className="text-xl font-medium text-white mb-6 border-b border-white/5 pb-4">Profil du Salon</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Nom du Salon *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Téléphone</label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="Numéro de contact"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Adresse Postale</label>
                            <input
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                placeholder="Lieu de votre salon"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            />
                            {address && (
                                <div className="mt-4 w-full h-48 md:h-64 rounded-xl overflow-hidden border border-white/10 relative">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen={false}
                                        loading="lazy"
                                        src={`https://maps.google.com/maps?q=${encodeURI(address + (name ? ", " + name : ""))}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                    ></iframe>
                                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-sm px-3 py-1 rounded text-xs text-slate-300 font-medium border border-white/10">
                                        Prévisualisation
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-semibold text-slate-300 block mb-2">Courte Description</label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    placeholder="Présentez votre salon en quelques mots..."
                                    rows={5}
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-semibold text-slate-300 block mb-2">Logo du Salon</label>
                                <p className="text-xs text-slate-500 mb-4">Sera affiché en haut à gauche de la page de réservation.</p>
                                <div className="flex gap-4 items-center">
                                    {logo && (
                                        <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-white/10 flex-shrink-0 bg-white/5 flex flex-col justify-center">
                                            <img src={logo} alt="Logo du salon" className="w-full h-auto object-contain max-h-full" />
                                            <button onClick={() => setLogo(null)} className="absolute top-1 right-1 p-1 bg-red-500 rounded-md text-white">
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}
                                    <label className={`flex-1 h-24 rounded-lg border-2 border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-emerald-400 relative ${logo ? 'w-auto' : 'w-full'}`}>
                                        {isUploading ? (
                                            <span className="text-xs font-medium animate-pulse">Envoi...</span>
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5 mb-1" />
                                                <span className="text-xs font-medium">{logo ? 'Modifier' : 'Ajouter un logo'}</span>
                                            </>
                                        )}
                                        <input type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} disabled={isUploading} />
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Photos de l'enseigne</label>
                            <p className="text-xs text-slate-500 mb-4">La première photo sera utilisée comme couverture. Les autres s'afficheront en galerie.</p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {images.map((img, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden border border-white/10 group">
                                        <img src={img} alt={`Salon ${idx + 1}`} className="w-full h-full object-cover" />
                                        <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 p-1.5 bg-red-500 rounded-md text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                        {idx === 0 && <span className="absolute bottom-2 left-2 bg-emerald-500 text-black text-[10px] font-bold px-2 py-0.5 rounded uppercase">Couverture</span>}
                                    </div>
                                ))}
                                <label className="aspect-video rounded-lg border-2 border-dashed border-white/20 hover:border-emerald-500/50 hover:bg-white/5 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400 hover:text-emerald-400 relative">
                                    {isUploading ? (
                                        <span className="text-xs font-medium animate-pulse">Envoi...</span>
                                    ) : (
                                        <>
                                            <Plus className="w-6 h-6 mb-2" />
                                            <span className="text-xs font-medium">Ajouter</span>
                                        </>
                                    )}
                                    <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} disabled={isUploading} />
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2 mt-4 pt-6 border-t border-white/5">
                            <label className="text-sm font-semibold text-slate-300 block mb-2">Bannière de couverture (Hero)</label>
                            <p className="text-xs text-slate-500 mb-4">Sera affichée tout en haut de votre page de réservation.</p>

                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                                {availableHeroImages.map((hero) => (
                                    <button
                                        key={hero.id}
                                        onClick={() => setHeroImage(hero.url)}
                                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition-all group shrink-0 ${heroImage === hero.url ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "border-white/10 opacity-60 hover:opacity-100 hover:border-white/30"}`}
                                    >
                                        {hero.url ? (
                                            <>
                                                <img src={hero.url} alt={hero.name} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <span className="text-white text-xs font-bold drop-shadow-md">{hero.name}</span>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                                                <span className="text-slate-500 text-xs font-semibold uppercase tracking-widest">Aucune</span>
                                            </div>
                                        )}
                                        {heroImage === hero.url && (
                                            <div className="absolute top-1 right-1 bg-emerald-500 rounded-full p-0.5 z-10">
                                                <CheckCircle2 className="w-3 h-3 text-black" />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bloc Thème et Apparence */}
                <div className="bg-black border border-white/5 p-8 rounded-xl md:col-span-2">
                    <h2 className="text-xl font-medium text-white mb-6 border-b border-white/5 pb-4">Apparence</h2>

                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-slate-300 block font-medium">Couleur Principale</label>
                        <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                            Choisissez la couleur d'accentuation qui sera utilisée sur votre page de réservation pour correspondre à votre image de marque.
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {availableThemes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 ${theme === t.id
                                        ? "border-white bg-white/10"
                                        : "border-white/5 bg-black hover:border-white/20 hover:bg-white/5"
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-full shadow-lg ${t.color} ${theme === t.id ? 'ring-2 ring-offset-2 ring-offset-black ring-white scale-110 shadow-current' : ''} transition-all`}></div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider text-center ${theme === t.id ? 'text-white' : 'text-slate-400'}`}>
                                        {t.name.split(' ')[0]}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <label className="text-sm font-semibold text-slate-300 block font-medium">Typographie (Police)</label>
                            <div className="grid grid-cols-2 gap-3">
                                {availableFonts.map(f => (
                                    <button
                                        key={f.id}
                                        onClick={() => setFont(f.id)}
                                        className={`px-3 py-3 rounded-lg border transition-all ${font === f.id ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"}`}
                                    >
                                        <span className={`${f.style} text-sm`}>{f.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-white/5 pt-6">
                            <label className="text-sm font-semibold text-slate-300 block font-medium">Style des formes</label>
                            <div className="grid grid-cols-3 gap-3">
                                {availableRadiuses.map(r => (
                                    <button
                                        key={r.id}
                                        onClick={() => setBorderRadius(r.id)}
                                        className={`px-2 py-3 border transition-all flex justify-center items-center ${borderRadius === r.id ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-bold" : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"} ${r.css}`}
                                    >
                                        <span className="text-xs">{r.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-4 border-t border-white/5 pt-6 md:col-span-2">
                            <label className="text-sm font-semibold text-slate-300 block font-medium">Mode (Ambiance Générale)</label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {availableModes.map(m => (
                                    <button
                                        key={m.id}
                                        onClick={() => setMode(m.id)}
                                        className={`px-4 py-4 rounded-xl border-2 transition-all flex justify-center items-center gap-3 ${mode === m.id ? "border-emerald-500 ring-2 ring-emerald-500/20" : "border-transparent"} ${m.bg}`}
                                    >
                                        <span className="font-bold text-sm tracking-wide">{m.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bloc Réservation */}
                <div className="bg-black border border-white/5 p-8 rounded-xl">
                    <h2 className="text-xl font-medium text-white mb-6 border-b border-white/5 pb-4">Règles de Réservation</h2>

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2 font-medium">Bloquer les réservations de dernière minute</label>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                Définissez un délai minimum avant qu'un client ne puisse réserver, afin de ne pas être pris de court par de nouvelles réservations surprises le jour même.
                            </p>
                            <select
                                value={advanceBookingDays}
                                onChange={(e) => setAdvanceBookingDays(parseInt(e.target.value))}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                            >
                                <option value={0} className="bg-black">Immédiat (Autoriser le jour-même)</option>
                                <option value={1} className="bg-black">1 jour à l'avance</option>
                                <option value={2} className="bg-black">2 jours à l'avance</option>
                                <option value={3} className="bg-black">3 jours à l'avance</option>
                                <option value={7} className="bg-black">1 semaine à l'avance</option>
                                <option value={14} className="bg-black">2 semaines à l'avance</option>
                                <option value={30} className="bg-black">1 mois à l'avance</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bloc Partager */}
                <div className="bg-black border border-white/5 p-8 rounded-xl md:col-span-2">
                    <div className="flex items-center gap-3 mb-6 border-b border-white/5 pb-4">
                        <Link2 className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-xl font-medium text-white">Partager mon salon</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        {/* URL + Actions */}
                        <div className="flex-1 space-y-4">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Partagez ce lien avec vos clients — via Instagram, WhatsApp, ou votre site web.
                                Ils pourront réserver directement depuis leur téléphone.
                            </p>

                            <div className="flex items-center gap-3 p-4 bg-white/5 border border-white/10 rounded-xl">
                                <span className="text-emerald-500"><Link2 className="w-4 h-4" /></span>
                                <p className="flex-1 text-sm font-mono text-slate-300 truncate">/book/{salonSlug}</p>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${copied
                                        ? "bg-emerald-500 text-black"
                                        : "bg-white/10 text-white hover:bg-white/20"
                                        }`}
                                >
                                    {copied ? <><CheckCircle2 className="w-4 h-4" /> Copié !</> : <><Copy className="w-4 h-4" /> Copier</>}
                                </button>
                            </div>

                            <a
                                href={`/book/${salonSlug}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 text-sm text-emerald-500 hover:text-emerald-400 transition-colors font-medium"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Voir ma page de réservation
                            </a>

                            <div className="border-t border-white/5 pt-4">
                                <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-3">Où le partager ?</p>
                                <div className="grid grid-cols-2 gap-2 text-xs text-slate-400">
                                    <div className="flex items-center gap-2 p-2 bg-white/3 rounded-lg">
                                        <span>📸</span> Instagram bio
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white/3 rounded-lg">
                                        <span>💬</span> WhatsApp
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white/3 rounded-lg">
                                        <span>🔵</span> Google Business
                                    </div>
                                    <div className="flex items-center gap-2 p-2 bg-white/3 rounded-lg">
                                        <span>🌐</span> Votre site web
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* QR Code */}
                        <div className="flex flex-col items-center gap-3 shrink-0">
                            <div className="p-3 bg-white rounded-2xl shadow-lg">
                                <img
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(bookingUrl)}`}
                                    alt="QR Code salon"
                                    className="w-40 h-40 rounded-xl"
                                />
                            </div>
                            <button
                                onClick={handlePrintQR}
                                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm font-semibold rounded-lg transition-all w-full justify-center"
                            >
                                <Printer className="w-4 h-4" />
                                Imprimer
                            </button>
                            <p className="text-xs text-slate-600 text-center max-w-[160px]">
                                À afficher en vitrine
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stripe Connect - Paiements directs */}
                <div className="bg-black border border-white/5 p-8 rounded-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4">
                        <CreditCard className="w-20 h-20 text-white/5 rotate-12" />
                    </div>

                    <h2 className="text-xl font-medium text-white mb-6 border-b border-white/5 pb-4">🏦 Encaissement des Paiements</h2>

                    <div className="flex flex-col md:flex-row gap-8 items-start">
                        <div className="flex-1 space-y-4">
                            <p className="text-sm text-slate-400 leading-relaxed">
                                Connectez votre propre compte **Stripe** pour recevoir l'argent des acomptes directement sur votre compte bancaire.
                            </p>

                            <div className="flex items-center gap-3 py-2">
                                {salon.stripeConnected ? (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                        <CheckCircle2 className="w-4 h-4" /> Compte Connecté
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-500 text-xs font-bold uppercase tracking-wider">
                                        <AlertCircle className="w-4 h-4" /> Configuration Requise
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="shrink-0">
                            <button
                                onClick={handleConnectStripe}
                                disabled={isConnecting || isChecking}
                                className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${salon.stripeConnected ? "bg-white/5 text-white border border-white/10 hover:bg-white/10" : "bg-[#635bff] text-white hover:bg-[#5851e0] shadow-lg shadow-[#635bff]/20"}`}
                            >
                                {isConnecting || isChecking ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : salon.stripeConnected ? (
                                    <>Gérer mon compte Stripe <ExternalLink className="w-4 h-4" /></>
                                ) : (
                                    <>Connecter avec Stripe</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Anti-lapin (Acomptes) */}
                <div className="bg-black border border-white/5 p-8 rounded-xl relative">
                    <h2 className="text-xl font-medium text-white mb-6 border-b border-white/5 pb-4">🛡️ Protection Anti-Lapin</h2>

                    <div className="space-y-6">
                        <div>
                            <label className="text-sm font-semibold text-slate-300 block mb-2 font-medium">Type d'acompte</label>
                            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
                                Choisissez si vous souhaitez demander un paiement à la réservation pour bloquer le créneau.
                            </p>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: "none", name: "Désactivé" },
                                    { id: "fixed", name: "Montant fixe (€)" },
                                    { id: "percentage", name: "Pourcentage (%)" }
                                ].map((opt) => (
                                    <button
                                        key={opt.id}
                                        onClick={() => setDepositType(opt.id)}
                                        className={`px-4 py-3 rounded-xl border text-sm font-medium transition-all ${depositType === opt.id ? "border-emerald-500 bg-emerald-500/10 text-emerald-400" : "border-white/10 bg-white/5 text-slate-400 hover:border-white/20"}`}
                                    >
                                        {opt.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {depositType !== "none" && (
                            <div className="pt-4 border-t border-white/5 animate-in fade-in slide-in-from-top-2">
                                <label className="text-sm font-semibold text-slate-300 block mb-2 font-medium">
                                    {depositType === "fixed" ? "Montant de l'acompte (€)" : "Pourcentage de l'acompte (%)"}
                                </label>
                                <input
                                    type="number"
                                    value={depositValue}
                                    onChange={(e) => setDepositValue(parseFloat(e.target.value))}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-bold text-lg"
                                    placeholder={depositType === "fixed" ? "Ex: 10" : "Ex: 20"}
                                />
                                <p className="text-[10px] text-slate-500 mt-2 italic px-1">
                                    {depositType === "fixed"
                                        ? `Le client devra payer ${depositValue}€ pour valider son rendez-vous.`
                                        : `Le client devra régler ${depositValue}% du prix total de la prestation.`}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
