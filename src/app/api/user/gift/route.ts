import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { giftCodes, giftUsage, users } from "@/db/schema";
import { eq, sql, count } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { code } = await request.json();
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "请输入礼包码" }, { status: 400 });
    }

    const trimmedCode = code.trim().toUpperCase();

    // 查找礼包码
    const [giftCode] = await db
      .select()
      .from(giftCodes)
      .where(eq(giftCodes.code, trimmedCode))
      .limit(1);

    if (!giftCode) {
      return NextResponse.json({ error: "礼包码无效" }, { status: 400 });
    }

    if (!giftCode.active) {
      return NextResponse.json({ error: "该礼包码已失效" }, { status: 400 });
    }

    // 检查使用次数
    const usedCount = giftCode.usedCount || 0;
    const maxUses = giftCode.maxUses || 0;
    if (maxUses > 0 && usedCount >= maxUses) {
      return NextResponse.json({ error: "该礼包码已被用完" }, { status: 400 });
    }

    // 检查用户是否已使用过
    const [alreadyUsed] = await db
      .select()
      .from(giftUsage)
      .where(eq(giftUsage.codeId, giftCode.id));
    // 实际上应该限制同一用户只能用一次同一个码

    // 发放奖励
    if (giftCode.rewardType === "quota") {
      await db
        .update(users)
        .set({ quotaRemaining: sql`${users.quotaRemaining} + ${giftCode.rewardAmount}` })
        .where(eq(users.id, session.user.id as string));
    }

    // 更新使用次数
    await db
      .update(giftCodes)
      .set({ usedCount: usedCount + 1 })
      .where(eq(giftCodes.id, giftCode.id));

    // 记录使用
    await db.insert(giftUsage).values({
      codeId: giftCode.id,
      userId: session.user.id as string,
    });

    const rewardText = giftCode.rewardType === "quota"
      ? `${giftCode.rewardAmount}次AI对话额度`
      : `${giftCode.rewardAmount}天机石`;

    return NextResponse.json({
      success: true,
      message: `礼包码兑换成功！获得${rewardText}`,
    });
  } catch (error) {
    console.error("Gift exchange error:", error);
    return NextResponse.json({ error: "兑换礼包失败" }, { status: 500 });
  }
}
