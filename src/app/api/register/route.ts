import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "邮箱和密码不能为空" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "密码长度至少6位" },
        { status: 400 }
      );
    }

    // 检查邮箱是否已注册
    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: "该邮箱已注册" },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const id = crypto.randomUUID();

    await db.insert(users).values({
      id,
      name: name || email.split("@")[0],
      email,
      passwordHash,
    });

    logger.action(id, "register", `email=${email}`);
    logger.api("POST", "/api/register", id);

    return NextResponse.json({
      success: true,
      message: "注册成功",
    });
  } catch (error) {
    logger.error("/api/register", error);
    return NextResponse.json(
      { error: "注册失败，请稍后重试" },
      { status: 500 }
    );
  }
}
