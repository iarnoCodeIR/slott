import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
    let supabaseResponse = NextResponse.next({ request });

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() { return request.cookies.getAll(); },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({ request });
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const path = request.nextUrl.pathname;

    // Protect /dashboard and /onboarding — redirect to login if not authenticated
    if ((path.startsWith("/dashboard") || path.startsWith("/onboarding")) && !user) {
        return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // If logged in and trying to access /auth/* → redirect to dashboard
    if (path.startsWith("/auth") && user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Block /auth/register without paid=1 (must pay before registering)
    if (path === "/auth/register") {
        const paid = request.nextUrl.searchParams.get("paid");
        if (paid !== "1") {
            return NextResponse.redirect(new URL("/#pricing", request.url));
        }
    }

    return supabaseResponse;
}

export const config = {
    matcher: ["/dashboard/:path*", "/onboarding/:path*", "/auth/:path*"],
};
