import { prisma } from "./prisma";

/**
 * Check if a subscription is active for a given email.
 * Returns true if the subscription status is "active" or "trialing".
 */
export async function isSubscriptionActive(email: string): Promise<boolean> {
    try {
        const sub = await prisma.subscription.findUnique({
            where: { email },
        });
        return sub?.status === "active" || sub?.status === "trialing";
    } catch {
        return false;
    }
}

/**
 * Check if ANY subscription is active (for single-tenant demo mode where
 * there is no user auth — we just check if at least one active subscription exists).
 */
export async function hasAnyActiveSubscription(): Promise<boolean> {
    try {
        const sub = await prisma.subscription.findFirst({
            where: { status: { in: ["active", "trialing"] } },
        });
        return !!sub;
    } catch {
        return false;
    }
}
