"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Zap } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase-client";

function RegisterForm() {
    const searchParams = useSearchParams();
    const emailParam = searchParams.get("email") || "";
    const isPaid = searchParams.get("paid") === "1";

    const [email, setEmail] = useState(emailParam);
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        // Bloquer l'accès direct sans paiement préalable
        if (!isPaid) {
            router.replace("/#pricing");
        }
        if (emailParam) setEmail(emailParam);
    }, [isPaid, emailParam, router]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createSupabaseClient();
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else if (data.session) {
            router.push("/onboarding");
            router.refresh();
        } else {
            // Email confirmation required — redirect to a waiting page
            router.push(`/auth/confirm?email=${encodeURIComponent(email)}`);
        }
    };

    // Don't render form until we confirm paid=1
    if (!isPaid) return null;

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <div className="text-3xl font-bold tracking-tighter mb-8 text-center">
                    SLO<span className="text-emerald-500">T</span>T
                </div>

                {/* Paid confirmation banner */}
                <div className="mb-8 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center gap-3">
                    <Zap className="w-6 h-6 text-emerald-500 shrink-0" />
                    <div>
                        <p className="text-emerald-400 font-bold text-sm">Paiement confirmé ! 🎉</p>
                        <p className="text-slate-400 text-xs mt-0.5">Créez votre mot de passe pour accéder à votre dashboard.</p>
                    </div>
                </div>

                <h1 className="text-2xl font-bold mb-2 text-center">Activez votre compte</h1>
                <p className="text-slate-400 text-sm text-center mb-8">Dernière étape avant votre dashboard SLOTT</p>

                <form onSubmit={handleRegister} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        readOnly={!!emailParam}
                        className={`w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all ${emailParam ? "opacity-60 cursor-not-allowed" : ""}`}
                    />
                    <input
                        type="password"
                        placeholder="Choisissez un mot de passe (min. 8 caractères)"
                        required
                        minLength={8}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                    />

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading
                            ? <><Loader2 className="w-5 h-5 animate-spin" /> Création du compte...</>
                            : "Accéder à mon dashboard →"
                        }
                    </button>
                </form>

                <p className="text-slate-600 text-xs text-center mt-6">
                    Déjà un compte ?{" "}
                    <a href="/auth/login" className="text-slate-400 hover:text-white transition-colors">
                        Se connecter
                    </a>
                </p>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense>
            <RegisterForm />
        </Suspense>
    );
}
