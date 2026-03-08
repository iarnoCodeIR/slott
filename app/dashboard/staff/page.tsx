import { getStaff } from "./actions";
import StaffManager from "./StaffManager";
import { getUser } from "@/lib/supabase-server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
    const user = await getUser();
    if (!user) redirect("/auth/login");

    const staff = await getStaff();

    return (
        <div className="p-10 font-sans w-full max-w-7xl mx-auto">
            <StaffManager initialStaff={staff} />
        </div>
    );
}
