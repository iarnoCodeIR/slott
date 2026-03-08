"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { getUnreadAppointmentsCount } from "./actions";
import Link from "next/link";

export default function NotificationBell() {
    const [count, setCount] = useState(0);

    // Initial fetch
    useEffect(() => {
        const fetchCount = async () => {
            const res = await getUnreadAppointmentsCount();
            if (res.success && res.count !== undefined) {
                setCount(res.count);
            }
        };
        fetchCount();

        // Optionnel : Poll API toutes les x minutes
        const intervalId = setInterval(fetchCount, 60000); // 1 minute
        return () => clearInterval(intervalId);
    }, []);

    const handleBellClick = () => {
        // Optimistic update : on met à zéro
        setCount(0);
    };

    return (
        <Link
            href="/dashboard/notifications"
            onClick={handleBellClick}
            className="p-2 relative text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 rounded-full flex items-center justify-center border border-white/5"
        >
            <Bell className="w-5 h-5" />

            {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#050505] animate-pulse">
                    {count}
                </span>
            )}
        </Link>
    );
}
