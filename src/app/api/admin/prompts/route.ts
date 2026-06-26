import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { promptConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

// 获取所有提示词
export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const configs = await db.select().from(promptConfigs);
  return NextResponse.json({ success: true, data: configs });
}

// 保存/更新提示词
export async function PUT(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { key, content } = await request.json();
    if (!key || content === undefined) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(promptConfigs)
      .where(eq(promptConfigs.key, key))
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(promptConfigs)
        .set({ content, updatedAt: new Date() })
        .where(eq(promptConfigs.key, key));
    } else {
      await db.insert(promptConfigs).values({ key, content });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Prompt save error:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
