import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { virtualCurrency, users } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const list = await db
      .select({
        id: virtualCurrency.id,
        userId: virtualCurrency.userId,
        balance: virtualCurrency.balance,
        totalEarned: virtualCurrency.totalEarned,
        totalSpent: virtualCurrency.totalSpent,
        updatedAt: virtualCurrency.updatedAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(virtualCurrency)
      .leftJoin(users, eq(virtualCurrency.userId, users.id))
      .orderBy(desc(virtualCurrency.balance))
      .limit(100);

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin currency users error:", error);
    return NextResponse.json({ error: "获取积分用户失败" }, { status: 500 });
  }
}
