"use client";

import React, { useState } from "react";
import { Zap, CheckCircle2, Loader2 } from "lucide-react";

export default function SubscribeGate() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubscribe = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();

            if (data.url) {
                window.location.href = data.url;
            } else {
                setError(data.error || "Une erreur s'est produite.");
            }
        } catch {
            setError("Impossible de contacter le serveur.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-md">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-8">
                    <Zap className="w-8 h-8 text-emerald-500" />
                </div>

                <h1 className="text-3xl font-bold text-center mb-2 tracking-tight">
                    Activez votre accès SLOTT
                </h1>
                <p className="text-slate-400 text-center mb-10 leading-relaxed">
                    Votre abonnement est requis pour accéder au dashboard.<br />
                    49€/mois · Résiliable à tout moment.
                </p>

                {/* Features */}
                <div className="space-y-3 mb-10">
                    {[
                        "Agenda en temps réel",
                        "Gestion de l'équipe & des prestations",
                        "Page de réservation brandée",
                        "Anti double-booking automatique",
                        "Notifications instantanées",
                        "QR Code & lien de partage",
                    ].map((f) => (
                        <div key={f} className="flex items-center gap-3 text-sm text-slate-300">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            {f}
                        </div>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubscribe} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Votre adresse email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />

                    {error && (
                        <p className="text-red-400 text-sm text-center">{error}</p>
                    )}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Redirection...</>
                        ) : (
                            <>Démarrer pour 49€/mois</>
                        )}
                    </button>

                    <p className="text-xs text-slate-600 text-center">
                        Paiement sécurisé via Stripe · Sans engagement · Annulable à tout moment
                    </p>
                </form>
            </div>
        </div>
    );
}
