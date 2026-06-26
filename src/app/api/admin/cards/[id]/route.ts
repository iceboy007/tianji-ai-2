import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { discoverCards } from "@/db/schema";
import { eq } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

// 更新卡片
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { id } = await params;
    const { title, description, slug, icon, sortOrder, active } = await request.json();

    await db
      .update(discoverCards)
      .set({
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(slug !== undefined && { slug }),
        ...(icon !== undefined && { icon }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(active !== undefined && { active }),
      })
      .where(eq(discoverCards.id, parseInt(id)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Card update error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

// 删除卡片
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { id } = await params;
    await db.delete(discoverCards).where(eq(discoverCards.id, parseInt(id)));
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Card delete error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
