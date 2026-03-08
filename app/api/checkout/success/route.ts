import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
        return NextResponse.redirect(new URL("/#pricing", req.url));
    }

    let email = "";

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        if (session.payment_status === "paid" || session.status === "complete") {
            email = session.metadata?.email || session.customer_email || "";
            const customerId = session.customer as string;
            const subscriptionId = session.subscription as string;

            if (email) {
                await prisma.subscription.upsert({
                    where: { email },
                    create: {
                        email,
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        status: "active",
                    },
                    update: {
                        stripeCustomerId: customerId,
                        stripeSubscriptionId: subscriptionId,
                        status: "active",
                    },
                });
            }
        }
    } catch (err) {
        console.error("Success route error:", err);
    }

    // Redirect to register with email pre-filled so user can set their password
    const redirectUrl = email
        ? `/auth/register?email=${encodeURIComponent(email)}&paid=1`
        : `/auth/register?paid=1`;

    return NextResponse.redirect(new URL(redirectUrl, req.url));
}
