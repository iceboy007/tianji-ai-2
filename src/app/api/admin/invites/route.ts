import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { inviteCodes, users } from "@/db/schema";
import { eq, sql, desc, count } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    // 邀请码统计
    const [totalCodes] = await db.select({ count: count() }).from(inviteCodes);
    const [usedCodes] = await db.select({ count: count() }).from(inviteCodes).where(sql`${inviteCodes.usedById} IS NOT NULL`);

    // 邀请码列表
    const list = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        creatorId: inviteCodes.creatorId,
        creatorName: users.name,
        usedById: inviteCodes.usedById,
        usedByName: sql<string>`(SELECT name FROM ${users} WHERE ${users.id} = ${inviteCodes.usedById})`.as("used_by_name"),
        rewardQuota: inviteCodes.rewardQuota,
        createdAt: inviteCodes.createdAt,
        usedAt: inviteCodes.usedAt,
      })
      .from(inviteCodes)
      .leftJoin(users, eq(inviteCodes.creatorId, users.id))
      .orderBy(desc(inviteCodes.createdAt))
      .limit(100);

    return NextResponse.json({
      success: true,
      data: {
        stats: { total: totalCodes?.count ?? 0, used: usedCodes?.count ?? 0 },
        invites: list,
      },
    });
  } catch (error) {
    console.error("Admin invites error:", error);
    return NextResponse.json({ error: "获取邀请码列表失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { count } = await request.json();
    const batchCount = Math.min(parseInt(count) || 1, 20);
    const codes: string[] = [];

    for (let i = 0; i < batchCount; i++) {
      const code = Array.from({ length: 8 }, () => "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"[Math.floor(Math.random() * 36)]).join("");
      await db.insert(inviteCodes).values({ code, rewardQuota: 3 });
      codes.push(code);
    }

    return NextResponse.json({ success: true, data: { codes, count: batchCount } });
  } catch (error) {
    console.error("Admin invites batch error:", error);
    return NextResponse.json({ error: "批量生成邀请码失败" }, { status: 500 });
  }
}
