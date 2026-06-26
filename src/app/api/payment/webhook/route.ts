import { NextRequest, NextResponse } from "next/server";
import { getStripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";

// Stripe webhook 需要原始 body，禁用 body 解析
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = (await headers()).get("stripe-signature") || "";

    let event;
    try {
      event = getStripe().webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
    } catch {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    // 处理支付成功事件
    if (event.type === "checkout.session.completed") {
      const stripeSession = event.data.object as any;
      const { userId, quotaAmount } = stripeSession.metadata || {};

      if (userId && quotaAmount) {
        // 更新订单状态
        const [order] = await db
          .select()
          .from(orders)
          .where(eq(orders.stripeSessionId, stripeSession.id))
          .limit(1);

        if (order) {
          await db
            .update(orders)
            .set({ status: "paid", paidAt: new Date() })
            .where(eq(orders.id, order.id));
        }

        // 增加用户额度并升级会员
        const memberExpiresAt = new Date();
        memberExpiresAt.setMonth(memberExpiresAt.getMonth() + 1); // 一个月会员

        await db
          .update(users)
          .set({
            quotaRemaining: sql`${users.quotaRemaining} + ${parseInt(quotaAmount)}`,
            memberType: "premium",
            memberExpiresAt,
          })
          .where(eq(users.id, userId));

        logger.action(userId, "payment_success", `plan=${stripeSession.metadata?.planId} quota=+${quotaAmount}`);
        logger.api("POST", "/api/payment/webhook", userId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error("/api/payment/webhook", error);
    return NextResponse.json({ error: "Webhook error" }, { status: 500 });
  }
}
