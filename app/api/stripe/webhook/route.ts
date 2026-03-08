import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
    const body = await req.text();
    const sig = req.headers.get("stripe-signature") as string;

    let event: Stripe.Event;

    try {
        if (!endpointSecret) {
            console.error("STRIPE_WEBHOOK_SECRET is not set");
            return NextResponse.json({ error: "Configuration error" }, { status: 500 });
        }
        event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
    } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object as Stripe.Checkout.Session;

            // 1. Handle SaaS Subscription
            if (session.mode === "subscription") {
                const customerId = session.customer as string;
                const subscriptionId = session.subscription as string;
                const email = session.customer_email || session.metadata?.email;

                if (email) {
                    await (prisma.subscription as any).upsert({
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

            // 2. Handle Booking Deposit (Anti-lapin)
            if (session.metadata?.type === "deposit") {
                const appointmentIds = JSON.parse(session.metadata.appointmentIds || "[]");
                if (appointmentIds.length > 0) {
                    await (prisma.appointment as any).updateMany({
                        where: { id: { in: appointmentIds } },
                        data: {
                            status: "CONFIRMED",
                            paymentStatus: "PAID",
                            isPaid: true
                        }
                    });
                }
            }
            break;

        case "invoice.payment_succeeded":
            // Handle recurring subscription payments
            const invoice = event.data.object as any;
            if (invoice.subscription) {
                await (prisma.subscription as any).update({
                    where: { stripeSubscriptionId: invoice.subscription as string },
                    data: { status: "active" }
                });
            }
            break;

        case "customer.subscription.deleted":
            // Handle cancellations
            const sub = event.data.object as any;
            await (prisma.subscription as any).update({
                where: { stripeSubscriptionId: sub.id },
                data: { status: "canceled" }
            });
            break;

        case "account.updated":
            const account = event.data.object as any;
            // Mark salon as connected when onboarding is complete
            if (account.details_submitted) {
                await (prisma.salon as any).updateMany({
                    where: { stripeAccountId: account.id },
                    data: { stripeConnected: true }
                });
            }
            break;
    }

    return NextResponse.json({ received: true });
}
