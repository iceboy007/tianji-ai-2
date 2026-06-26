import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { giftCodes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const list = await db
      .select()
      .from(giftCodes)
      .orderBy(desc(giftCodes.createdAt))
      .limit(50);

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Admin gift codes error:", error);
    return NextResponse.json({ error: "获取礼包码失败" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { code, rewardType, rewardAmount, maxUses, active } = await request.json();

    if (!code || !code.trim()) {
      return NextResponse.json({ error: "请输入礼包码" }, { status: 400 });
    }

    await db.insert(giftCodes).values({
      code: code.trim().toUpperCase(),
      rewardType: rewardType || "quota",
      rewardAmount: parseInt(rewardAmount) || 10,
      maxUses: maxUses === -1 ? -1 : (parseInt(maxUses) || 1),
      active: active !== undefined ? parseInt(active) : 1,
    });

    return NextResponse.json({ success: true, message: "礼包码已创建" });
  } catch (error) {
    console.error("Admin gift create error:", error);
    return NextResponse.json({ error: "创建礼包码失败" }, { status: 500 });
  }
}
