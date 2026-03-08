import { getSalonSettings } from "./actions";
import SettingsClient from "./SettingsClient";
import { getUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const user = await getUser();
    if (!user) redirect("/auth/login");

    const salon = await getSalonSettings();
    if (!salon) redirect("/onboarding");

    return (
        <SettingsClient salon={salon} />
    );
}
