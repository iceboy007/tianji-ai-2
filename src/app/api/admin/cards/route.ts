import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { discoverCards } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

// 获取所有卡片
export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  const cards = await db
    .select()
    .from(discoverCards)
    .orderBy(desc(discoverCards.sortOrder));

  return NextResponse.json({ success: true, data: cards });
}

// 新增卡片
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { title, description, slug, icon, sortOrder, active } = await request.json();
    if (!title || !slug) {
      return NextResponse.json({ error: "标题和slug不能为空" }, { status: 400 });
    }

    const [card] = await db
      .insert(discoverCards)
      .values({
        title,
        description: description || "",
        slug,
        icon: icon || "☰",
        sortOrder: sortOrder || 0,
        active: active ?? 1,
      })
      .returning();

    return NextResponse.json({ success: true, data: card });
  } catch (error) {
    console.error("Card create error:", error);
    return NextResponse.json({ error: "创建失败" }, { status: 500 });
  }
}
