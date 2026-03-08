import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json({ error: "Email requis" }, { status: 400 });
        }

        if (!process.env.STRIPE_PRICE_ID) {
            return NextResponse.json({ error: "STRIPE_PRICE_ID non configuré" }, { status: 500 });
        }

        const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";

        // Check if customer already exists
        let subscription = await prisma.subscription.findUnique({ where: { email } }).catch(() => null);
        let customerId = subscription?.stripeCustomerId;

        if (!customerId) {
            // Create Stripe customer
            const customer = await stripe.customers.create({ email });
            customerId = customer.id;

            // Upsert subscription record
            await prisma.subscription.upsert({
                where: { email },
                create: { email, stripeCustomerId: customerId, status: "inactive" },
                update: { stripeCustomerId: customerId },
            });
        }

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            customer: customerId,
            payment_method_types: ["card"],
            line_items: [
                {
                    price: process.env.STRIPE_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${baseUrl}/api/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${baseUrl}/#pricing`,
            metadata: { email },
        });

        return NextResponse.json({ url: session.url });
    } catch (err: any) {
        console.error("Checkout error:", err);
        return NextResponse.json({ error: err.message }, { status: 500 });
    }
}
