import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// 获取单个会话详情（含消息列表）
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "无效的会话ID" }, { status: 400 });
    }

    const [chatSession] = await db
      .select()
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, session.user.id as string)
        )
      )
      .limit(1);

    if (!chatSession) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    const messages = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);

    return NextResponse.json({
      success: true,
      data: { ...chatSession, messages },
    });
  } catch (error) {
    console.error("Session GET error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

// 删除会话
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    if (isNaN(sessionId)) {
      return NextResponse.json({ error: "无效的会话ID" }, { status: 400 });
    }

    // 验证所有权
    const [chatSession] = await db
      .select({ id: chatSessions.id })
      .from(chatSessions)
      .where(
        and(
          eq(chatSessions.id, sessionId),
          eq(chatSessions.userId, session.user.id as string)
        )
      )
      .limit(1);

    if (!chatSession) {
      return NextResponse.json({ error: "会话不存在" }, { status: 404 });
    }

    // CASCADE 会自动删除关联的消息
    await db.delete(chatSessions).where(eq(chatSessions.id, sessionId));

    return NextResponse.json({ success: true, message: "已删除" });
  } catch (error) {
    console.error("Session DELETE error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
