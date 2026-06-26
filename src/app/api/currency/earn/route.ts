import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { virtualCurrency, currencyTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// 完成任务获取积分
// 任务类型: daily_login, share, invite_used, complete_chart
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const userId = session.user.id as string;
    const earnAmount = 5; // 每次完成任务获得5积分

    // 确保积分账户存在
    let [currency] = await db
      .select()
      .from(virtualCurrency)
      .where(eq(virtualCurrency.userId, userId))
      .limit(1);

    if (!currency) {
      [currency] = await db
        .insert(virtualCurrency)
        .values({ userId, balance: 0, totalEarned: 0, totalSpent: 0 })
        .returning();
    }

    // 更新积分
    await db
      .update(virtualCurrency)
      .set({
        balance: sql`${virtualCurrency.balance} + ${earnAmount}`,
        totalEarned: sql`${virtualCurrency.totalEarned} + ${earnAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(virtualCurrency.userId, userId));

    // 记录流水
    await db.insert(currencyTransactions).values({
      userId,
      amount: earnAmount,
      type: "earn",
      description: "完成任务获得积分",
    });

    return NextResponse.json({
      success: true,
      message: `获得 ${earnAmount} 天机石`,
      data: { earned: earnAmount },
    });
  } catch (error) {
    console.error("Currency earn error:", error);
    return NextResponse.json({ error: "获取积分失败" }, { status: 500 });
  }
}
