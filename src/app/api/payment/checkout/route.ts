import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { subscriptionPlans, orders } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getStripe } from "@/lib/stripe";
import { logger } from "@/lib/logger";
import { DEPLOY_URL } from "@/lib/config";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { planId } = await request.json();
    const userId = session.user.id as string;

    const [plan] = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.id, planId))
      .limit(1);

    if (!plan) {
      return NextResponse.json({ error: "套餐不存在" }, { status: 400 });
    }

    // 创建 Stripe Checkout Session
    const stripe = getStripe();
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "alipay", "wechat_pay"],
      line_items: [
        {
          price_data: {
            currency: "cny",
            product_data: {
              name: plan.name,
              description: plan.description || `${plan.quotaAmount}次AI对话额度`,
            },
            unit_amount: plan.priceCents,
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: `${DEPLOY_URL}/subscribe?success=true`,
      cancel_url: `${DEPLOY_URL}/subscribe?cancelled=true`,
      metadata: {
        userId,
        planId: String(planId),
        quotaAmount: String(plan.quotaAmount),
      },
    });

    // 创建订单记录
    const orderId = crypto.randomUUID();
    await db.insert(orders).values({
      id: orderId,
      userId,
      planId,
      amountCents: plan.priceCents,
      stripeSessionId: stripeSession.id,
      status: "pending",
    });

    logger.action(userId, "order_create", `plan=${plan.name} session=${stripeSession.id}`);

    return NextResponse.json({
      success: true,
      url: stripeSession.url,
    });
  } catch (error) {
    logger.error("/api/payment/checkout", error);
    return NextResponse.json({ error: "创建订单失败" }, { status: 500 });
  }
}
