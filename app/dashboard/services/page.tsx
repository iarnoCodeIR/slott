import { getServices } from "./actions";
import ServicesManager from "./ServicesManager";
import { getUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
    const user = await getUser();
    if (!user) redirect("/auth/login");

    const services = await getServices();

    return (
        <div className="p-10 font-sans w-full max-w-7xl mx-auto">
            <ServicesManager initialServices={services} />
        </div>
    );
}
