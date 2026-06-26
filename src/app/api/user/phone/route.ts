import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { phone } = await request.json();

    if (!phone || typeof phone !== "string") {
      return NextResponse.json({ error: "请输入手机号" }, { status: 400 });
    }

    // 简单验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      return NextResponse.json({ error: "请输入正确的手机号" }, { status: 400 });
    }

    await db
      .update(users)
      .set({ phone })
      .where(eq(users.id, session.user.id as string));

    return NextResponse.json({ success: true, message: "手机号已绑定" });
  } catch (error) {
    console.error("Phone bind error:", error);
    return NextResponse.json({ error: "绑定手机号失败" }, { status: 500 });
  }
}
