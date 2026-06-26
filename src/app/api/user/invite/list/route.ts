import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { inviteCodes, users } from "@/db/schema";
import { eq, count, sql, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    // 我生成的邀请码
    const myInvites = await db
      .select({
        id: inviteCodes.id,
        code: inviteCodes.code,
        usedById: inviteCodes.usedById,
        rewardQuota: inviteCodes.rewardQuota,
        createdAt: inviteCodes.createdAt,
        usedAt: inviteCodes.usedAt,
        usedByName: users.name,
      })
      .from(inviteCodes)
      .leftJoin(users, eq(inviteCodes.usedById, users.id))
      .where(eq(inviteCodes.creatorId, session.user.id as string))
      .orderBy(desc(inviteCodes.createdAt));

    // 总邀请数
    const [totalInvites] = await db
      .select({ count: count() })
      .from(inviteCodes)
      .where(eq(inviteCodes.creatorId, session.user.id as string));

    // 已使用数
    const [usedCount] = await db
      .select({ count: count() })
      .from(inviteCodes)
      .where(eq(inviteCodes.creatorId, session.user.id as string));

    // 简化: 统计已使用的
    const used = myInvites.filter((i) => i.usedById).length;

    return NextResponse.json({
      success: true,
      data: {
        invites: myInvites,
        totalCount: totalInvites?.count ?? 0,
        usedCount: used,
        totalReward: used * 3, // 每个有效邀请奖励3额度
      },
    });
  } catch (error) {
    console.error("Invite list error:", error);
    return NextResponse.json({ error: "获取邀请记录失败" }, { status: 500 });
  }
}
