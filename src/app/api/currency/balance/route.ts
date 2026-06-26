import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { virtualCurrency } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const userId = session.user.id as string;

    let [currency] = await db
      .select()
      .from(virtualCurrency)
      .where(eq(virtualCurrency.userId, userId))
      .limit(1);

    // 自动创建积分账户
    if (!currency) {
      [currency] = await db
        .insert(virtualCurrency)
        .values({ userId, balance: 0, totalEarned: 0, totalSpent: 0 })
        .returning();
    }

    return NextResponse.json({
      success: true,
      data: {
        balance: currency.balance,
        totalEarned: currency.totalEarned,
        totalSpent: currency.totalSpent,
      },
    });
  } catch (error) {
    console.error("Currency balance error:", error);
    return NextResponse.json({ error: "获取积分信息失败" }, { status: 500 });
  }
}
