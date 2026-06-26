import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { orders, subscriptionPlans } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const orderList = await db
      .select({
        id: orders.id,
        amountCents: orders.amountCents,
        status: orders.status,
        paidAt: orders.paidAt,
        createdAt: orders.createdAt,
        planName: subscriptionPlans.name,
        planDescription: subscriptionPlans.description,
      })
      .from(orders)
      .leftJoin(subscriptionPlans, eq(orders.planId, subscriptionPlans.id))
      .where(eq(orders.userId, session.user.id as string))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      success: true,
      data: orderList,
    });
  } catch (error) {
    console.error("Orders GET error:", error);
    return NextResponse.json({ error: "获取订单记录失败" }, { status: 500 });
  }
}
