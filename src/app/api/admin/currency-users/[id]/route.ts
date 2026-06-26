import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { virtualCurrency, currencyTransactions } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { id } = await params;
    const { balance } = await request.json();
    const currencyId = parseInt(id);

    if (isNaN(currencyId)) return NextResponse.json({ error: "无效的ID" }, { status: 400 });

    const [record] = await db.select().from(virtualCurrency).where(eq(virtualCurrency.id, currencyId)).limit(1);
    if (!record) return NextResponse.json({ error: "用户积分记录不存在" }, { status: 404 });

    const newBalance = parseInt(balance) || 0;
    const diff = newBalance - (record.balance ?? 0);

    await db.update(virtualCurrency).set({
      balance: newBalance,
      totalEarned: diff > 0 ? sql`${virtualCurrency.totalEarned} + ${diff}` : virtualCurrency.totalEarned,
      totalSpent: diff < 0 ? sql`${virtualCurrency.totalSpent} + ${Math.abs(diff)}` : virtualCurrency.totalSpent,
      updatedAt: new Date(),
    }).where(eq(virtualCurrency.id, currencyId));

    // 记录流水
    if (diff !== 0) {
      await db.insert(currencyTransactions).values({
        userId: record.userId,
        amount: Math.abs(diff),
        type: diff > 0 ? "earn" : "spend",
        description: `管理员手动${diff > 0 ? "增加" : "扣除"}${Math.abs(diff)}天机石`,
      });
    }

    return NextResponse.json({ success: true, message: "积分已更新" });
  } catch (error) {
    console.error("Admin currency update error:", error);
    return NextResponse.json({ error: "更新积分失败" }, { status: 500 });
  }
}
