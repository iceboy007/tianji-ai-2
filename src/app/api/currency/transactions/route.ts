import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { currencyTransactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const transactions = await db
      .select()
      .from(currencyTransactions)
      .where(eq(currencyTransactions.userId, session.user.id as string))
      .orderBy(desc(currencyTransactions.createdAt))
      .limit(50);

    return NextResponse.json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Currency transactions error:", error);
    return NextResponse.json({ error: "获取积分流水失败" }, { status: 500 });
  }
}
