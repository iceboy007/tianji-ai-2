import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, baziCharts, chatSessions, chatMessages } from "@/db/schema";
import { count, sql } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) {
    return NextResponse.json({ error: "无权限" }, { status: 403 });
  }

  try {
    const [userCount] = await db.select({ count: count() }).from(users);
    const [chartCount] = await db.select({ count: count() }).from(baziCharts);
    const [sessionCount] = await db.select({ count: count() }).from(chatSessions);
    const [msgCount] = await db.select({ count: count() }).from(chatMessages);

    // 今日新增
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // const [todayUsers] = await db.select({ count: count() }).from(users).where(sql`${users.createdAt} >= ${today}`);

    return NextResponse.json({
      success: true,
      data: {
        totalUsers: userCount?.count ?? 0,
        totalCharts: chartCount?.count ?? 0,
        totalSessions: sessionCount?.count ?? 0,
        totalMessages: msgCount?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
