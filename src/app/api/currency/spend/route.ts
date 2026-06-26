import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { virtualCurrency, currencyTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { amount, description } = await request.json();
    const userId = session.user.id as string;
    const spendAmount = parseInt(amount) || 1;

    // 检查余额
    const [currency] = await db
      .select()
      .from(virtualCurrency)
      .where(eq(virtualCurrency.userId, userId))
      .limit(1);

    if (!currency || currency.balance === null || currency.balance < spendAmount) {
      return NextResponse.json({ error: "积分不足" }, { status: 400 });
    }

    // 扣除积分
    await db
      .update(virtualCurrency)
      .set({
        balance: sql`${virtualCurrency.balance} - ${spendAmount}`,
        totalSpent: sql`${virtualCurrency.totalSpent} + ${spendAmount}`,
        updatedAt: new Date(),
      })
      .where(eq(virtualCurrency.userId, userId));

    // 记录流水
    await db.insert(currencyTransactions).values({
      userId,
      amount: spendAmount,
      type: "spend",
      description: description || "消费积分",
    });

    return NextResponse.json({
      success: true,
      message: `已消耗 ${spendAmount} 天机石`,
    });
  } catch (error) {
    console.error("Currency spend error:", error);
    return NextResponse.json({ error: "消费积分失败" }, { status: 500 });
  }
}
