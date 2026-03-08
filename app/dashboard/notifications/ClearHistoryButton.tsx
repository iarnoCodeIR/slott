"use client";

import React, { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { clearNotificationHistory } from "../actions";
import { useRouter } from "next/navigation";

export default function ClearHistoryButton({ disabled }: { disabled: boolean }) {
    const [isClearing, setIsClearing] = useState(false);
    const router = useRouter();

    const handleClear = async () => {
        if (!confirm("Voulez-vous vraiment effacer tout l'historique des notifications ?\nCela n'annulera pas les rendez-vous de l'agenda.")) return;

        setIsClearing(true);
        const res = await clearNotificationHistory();
        if (res.success) {
            router.refresh();
        } else {
            alert(res.error || "Une erreur est survenue");
        }
        setIsClearing(false);
    };

    return (
        <button
            onClick={handleClear}
            disabled={disabled || isClearing}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-semibold text-sm rounded-lg transition-colors border border-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Réinitialiser l'historique
        </button>
    );
}
