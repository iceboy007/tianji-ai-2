import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { inviteCodes, users } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "请输入邀请码" }, { status: 400 });
    }

    const trimmedCode = code.trim().toUpperCase();

    // 查找邀请码
    const [invite] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.code, trimmedCode))
      .limit(1);

    if (!invite) {
      return NextResponse.json({ error: "邀请码无效" }, { status: 400 });
    }

    if (invite.usedById) {
      return NextResponse.json({ error: "该邀请码已被使用" }, { status: 400 });
    }

    if (invite.creatorId === session.user.id) {
      return NextResponse.json({ error: "不能绑定自己生成的邀请码" }, { status: 400 });
    }

    // 检查用户是否已绑定过任何邀请码
    const [alreadyBound] = await db
      .select()
      .from(inviteCodes)
      .where(eq(inviteCodes.usedById, session.user.id as string))
      .limit(1);

    if (alreadyBound) {
      return NextResponse.json({ error: "您已经绑定过邀请码了" }, { status: 400 });
    }

    // 标记邀请码已使用
    await db
      .update(inviteCodes)
      .set({ usedById: session.user.id as string, usedAt: new Date() })
      .where(eq(inviteCodes.id, invite.id));

    // 给被邀请人发放额度奖励
    await db
      .update(users)
      .set({ quotaRemaining: sql`${users.quotaRemaining} + 3` })
      .where(eq(users.id, session.user.id as string));

    // 给邀请人发放额度奖励
    if (invite.creatorId) {
      await db
        .update(users)
        .set({ quotaRemaining: sql`${users.quotaRemaining} + ${invite.rewardQuota}` })
        .where(eq(users.id, invite.creatorId));
    }

    return NextResponse.json({
      success: true,
      message: `邀请码绑定成功！获得免费对话额度`,
      data: { reward: 3 },
    });
  } catch (error) {
    console.error("Invite bind error:", error);
    return NextResponse.json({ error: "绑定邀请码失败" }, { status: 500 });
  }
}
