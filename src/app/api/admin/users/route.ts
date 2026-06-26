import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { desc } from "drizzle-orm";

function isAdmin(session: any) {
  return session?.user?.email === process.env.ADMIN_EMAIL;
}

export async function GET() {
  const session = await auth();
  if (!isAdmin(session)) return NextResponse.json({ error: "无权限" }, { status: 403 });

  try {
    const list = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        quotaRemaining: users.quotaRemaining,
        createdAt: users.createdAt,
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json({ success: true, data: list });
  } catch (error) {
    console.error("Users list error:", error);
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
