import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const { id } = await params;
    const { quotaRemaining } = await request.json();

    await db
      .update(users)
      .set({ quotaRemaining })
      .where(eq(users.id, id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("User update error:", error);
    return NextResponse.json({ error: "更新失败" }, { status: 500 });
  }
}
