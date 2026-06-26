import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users, baziCharts, chatSessions } from "@/db/schema";
import { eq, count } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const [user] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        phone: users.phone,
        quotaRemaining: users.quotaRemaining,
        memberType: users.memberType,
        memberExpiresAt: users.memberExpiresAt,
        createdAt: users.createdAt,
      })
      .from(users)
      .where(eq(users.id, session.user.id as string))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: "用户不存在" }, { status: 404 });
    }

    const [chartCount] = await db
      .select({ count: count() })
      .from(baziCharts)
      .where(eq(baziCharts.userId, session.user.id as string));

    const [sessionCount] = await db
      .select({ count: count() })
      .from(chatSessions)
      .where(eq(chatSessions.userId, session.user.id as string));

    return NextResponse.json({
      success: true,
      data: {
        ...user,
        chartCount: chartCount?.count ?? 0,
        sessionCount: sessionCount?.count ?? 0,
      },
    });
  } catch (error) {
    console.error("Profile GET error:", error);
    return NextResponse.json({ error: "获取信息失败" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "昵称不能为空" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ name: name.trim() })
      .where(eq(users.id, session.user.id as string));

    return NextResponse.json({ success: true, message: "更新成功" });
  } catch (error) {
    console.error("Profile PUT error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
