import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { userMemories } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const memories = await db
      .select()
      .from(userMemories)
      .where(eq(userMemories.userId, session.user.id as string))
      .orderBy(userMemories.updatedAt);

    return NextResponse.json({ success: true, data: memories, count: memories.length });
  } catch (error) {
    console.error("Memories GET error:", error);
    return NextResponse.json({ error: "获取记忆失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { key, value } = await request.json();
    if (!key || !value) {
      return NextResponse.json({ error: "记忆内容和类型不能为空" }, { status: 400 });
    }

    // upsert: 如果同key已存在则更新，否则插入
    const [existing] = await db
      .select()
      .from(userMemories)
      .where(
        and(
          eq(userMemories.userId, session.user.id as string),
          eq(userMemories.key, key)
        )
      )
      .limit(1);

    if (existing) {
      await db
        .update(userMemories)
        .set({ value, updatedAt: new Date() })
        .where(eq(userMemories.id, existing.id));
    } else {
      await db.insert(userMemories).values({
        userId: session.user.id as string,
        key,
        value,
      });
    }

    return NextResponse.json({ success: true, message: "记忆已保存" });
  } catch (error) {
    console.error("Memories POST error:", error);
    return NextResponse.json({ error: "保存记忆失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "请指定要删除的记忆ID" }, { status: 400 });
    }

    await db.delete(userMemories).where(
      and(
        eq(userMemories.id, parseInt(id)),
        eq(userMemories.userId, session.user.id as string)
      )
    );

    return NextResponse.json({ success: true, message: "记忆已删除" });
  } catch (error) {
    console.error("Memories DELETE error:", error);
    return NextResponse.json({ error: "删除记忆失败" }, { status: 500 });
  }
}
