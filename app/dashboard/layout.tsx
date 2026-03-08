"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Users, Package, Settings, LogOut, CreditCard } from 'lucide-react';
import NotificationBell from './NotificationBell';
import { createSupabaseClient } from '@/lib/supabase-client';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { name: "Agenda", href: "/dashboard", icon: Calendar, exact: true },
        { name: "Prestations", href: "/dashboard/services", icon: Package, exact: false },
        { name: "Équipe", href: "/dashboard/staff", icon: Users, exact: false },
        { name: "Paiements", href: "/dashboard/payments", icon: CreditCard, exact: false },
        { name: "Paramètres", href: "/dashboard/settings", icon: Settings, exact: false },
    ];

    const handleLogout = async () => {
        const supabase = createSupabaseClient();
        await supabase.auth.signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-50 flex">
            {/* Sidebar — sticky so logout is always visible */}
            <aside className="w-64 border-r border-white/5 bg-black flex flex-col shrink-0 h-screen sticky top-0 overflow-y-auto">
                <div className="h-20 flex items-center justify-between px-6 border-b border-white/5">
                    <Link href="/" className="text-2xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                        SLO<span className="text-emerald-500">T</span>T
                    </Link>
                    <div className="flex gap-2 items-center">
                        <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest border border-slate-800 px-2 py-0.5 rounded-sm mr-1">Pro</span>
                        <NotificationBell />
                    </div>
                </div>

                <nav className="flex-1 py-8 px-4 space-y-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact ? pathname === item.href : pathname?.startsWith(item.href);

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center gap-3 px-4 py-3 font-medium transition-colors border ${isActive
                                    ? "bg-white/5 text-white border-white/10"
                                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border-transparent"
                                    }`}
                            >
                                <Icon className={`w-5 h-5 ${isActive ? "text-emerald-500" : ""}`} />
                                {item.name}
                            </Link>
                        )
                    })}
                </nav>

                <div className="p-6 border-t border-white/5">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 text-slate-500 hover:text-white transition-colors font-medium text-sm w-full"
                    >
                        <LogOut className="w-4 h-4" /> Se déconnecter
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}
