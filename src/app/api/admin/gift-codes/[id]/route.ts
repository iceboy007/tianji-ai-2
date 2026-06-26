import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { giftCodes } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { id } = await params;
    const body = await request.json();
    const giftId = parseInt(id);

    if (isNaN(giftId)) return NextResponse.json({ error: "无效的ID" }, { status: 400 });

    await db.update(giftCodes).set(body).where(eq(giftCodes.id, giftId));

    return NextResponse.json({ success: true, message: "已更新" });
  } catch (error) {
    console.error("Admin gift update error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "请先登录" }, { status: 401 });

  try {
    const { id } = await params;
    const giftId = parseInt(id);
    if (isNaN(giftId)) return NextResponse.json({ error: "无效的ID" }, { status: 400 });

    await db.delete(giftCodes).where(eq(giftCodes.id, giftId));
    return NextResponse.json({ success: true, message: "已删除" });
  } catch (error) {
    console.error("Admin gift delete error:", error);
    return NextResponse.json({ error: "删除失败" }, { status: 500 });
  }
}
