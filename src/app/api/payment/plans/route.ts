import { NextResponse } from "next/server";
import { db } from "@/db";
import { subscriptionPlans } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export async function GET() {
  try {
    const plans = await db
      .select()
      .from(subscriptionPlans)
      .where(eq(subscriptionPlans.active, 1))
      .orderBy(asc(subscriptionPlans.priceCents));

    return NextResponse.json({ success: true, data: plans });
  } catch {
    return NextResponse.json({ error: "获取失败" }, { status: 500 });
  }
}
