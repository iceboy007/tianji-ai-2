import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { inviteCodes } from "@/db/schema";
import { eq, count } from "drizzle-orm";
import { randomBytes } from "crypto";

function generateCode(): string {
  return randomBytes(4).toString("hex").toUpperCase(); // 8位字符
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const code = generateCode();
    await db.insert(inviteCodes).values({
      code,
      creatorId: session.user.id as string,
      rewardQuota: 3,
    });

    return NextResponse.json({
      success: true,
      data: { code },
      message: "邀请码已生成",
    });
  } catch (error) {
    console.error("Invite generate error:", error);
    return NextResponse.json({ error: "生成邀请码失败" }, { status: 500 });
  }
}
