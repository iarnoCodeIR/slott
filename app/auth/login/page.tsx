"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { createSupabaseClient } from "@/lib/supabase-client";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const supabase = createSupabaseClient();
        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message === "Invalid login credentials"
                ? "Email ou mot de passe incorrect."
                : error.message);
            setLoading(false);
        } else {
            router.push("/dashboard");
            router.refresh();
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm">
                <Link href="/" className="text-3xl font-bold tracking-tighter mb-10 text-center block hover:opacity-80 transition-opacity">
                    SLO<span className="text-emerald-500">T</span>T
                </Link>

                <h1 className="text-2xl font-bold mb-2 text-center">Connexion</h1>
                <p className="text-slate-400 text-sm text-center mb-8">Accédez à votre dashboard salon</p>

                <form onSubmit={handleLogin} className="space-y-4">
                    <input type="email" placeholder="Email" required value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />

                    <input type="password" placeholder="Mot de passe" required value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all" />

                    {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                    <button type="submit" disabled={loading}
                        className="w-full bg-emerald-500 text-black font-bold rounded-xl p-4 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Connexion...</> : "Se connecter"}
                    </button>
                </form>

                <p className="text-slate-500 text-sm text-center mt-6">
                    Pas encore de compte ?{" "}
                    <Link href="/auth/register" className="text-emerald-500 hover:text-emerald-400 font-medium">
                        Commencer ici
                    </Link>
                </p>
            </div>
        </div>
    );
}
