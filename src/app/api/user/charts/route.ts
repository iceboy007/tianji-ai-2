import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { baziCharts } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const charts = await db
      .select()
      .from(baziCharts)
      .where(eq(baziCharts.userId, session.user.id as string))
      .orderBy(desc(baziCharts.createdAt));

    return NextResponse.json({ success: true, data: charts });
  } catch (error) {
    console.error("Charts GET error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  try {
    const { name, gender, chartData } = await request.json();

    if (!name || !gender || !chartData) {
      return NextResponse.json({ error: "参数不完整" }, { status: 400 });
    }

    const userId = session.user.id as string;

    // 检查是否已有相同命盘（同一用户 + 相同出生信息）
    const existing = await db
      .select()
      .from(baziCharts)
      .where(
        and(
          eq(baziCharts.userId, userId),
          eq(baziCharts.name, name),
          eq(baziCharts.gender, gender)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      await db
        .update(baziCharts)
        .set({ chartData })
        .where(eq(baziCharts.id, existing[0].id));

      logger.action(userId, "chart_update", `name=${name}`);
      return NextResponse.json({
        success: true,
        data: { id: existing[0].id, updated: true },
      });
    }

    const [inserted] = await db
      .insert(baziCharts)
      .values({
        userId,
        name,
        gender,
        chartData,
      })
      .returning({ id: baziCharts.id });

    logger.action(userId, "chart_create", `name=${name}`);

    return NextResponse.json({
      success: true,
      data: { id: inserted.id, updated: false },
    });
  } catch (error) {
    console.error("Charts POST error:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}
