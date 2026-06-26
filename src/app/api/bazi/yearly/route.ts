import { NextRequest, NextResponse } from "next/server";

const BAZI_SERVICE_URL = process.env.BAZI_SERVICE_URL || "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BAZI_SERVICE_URL}/api/analyze-year`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: "流年分析服务暂时不可用" },
        { status: 502 }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Yearly analysis error:", error);
    return NextResponse.json(
      { success: false, error: "流年分析服务暂时不可用" },
      { status: 502 }
    );
  }
}
