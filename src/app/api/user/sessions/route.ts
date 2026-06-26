import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { chatSessions, chatMessages } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const sessions = await db
      .select({
        id: chatSessions.id,
        title: chatSessions.title,
        chartId: chatSessions.chartId,
        createdAt: chatSessions.createdAt,
        messageCount: sql<number>`count(${chatMessages.id})::int`,
      })
      .from(chatSessions)
      .leftJoin(chatMessages, eq(chatSessions.id, chatMessages.sessionId))
      .where(eq(chatSessions.userId, session.user.id as string))
      .groupBy(chatSessions.id)
      .orderBy(desc(chatSessions.createdAt));

    return NextResponse.json({ success: true, data: sessions });
  } catch (error) {
    console.error("Sessions GET error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { title, chartId, messages } = await request.json();

    const [inserted] = await db
      .insert(chatSessions)
      .values({
        userId: session.user.id as string,
        title: title || "新对话",
        chartId: chartId || null,
      })
      .returning({ id: chatSessions.id });

    // 如果有消息，一并写入
    if (messages && Array.isArray(messages) && messages.length > 0) {
      await db.insert(chatMessages).values(
        messages.map((m: { role: string; content: string }) => ({
          sessionId: inserted.id,
          role: m.role,
          content: m.content,
        }))
      );
    }

    return NextResponse.json({
      success: true,
      data: { id: inserted.id },
    });
  } catch (error) {
    console.error("Sessions POST error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
