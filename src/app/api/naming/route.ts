import { NextRequest, NextResponse } from "next/server";
import { model } from "@/lib/ai-service";
import { generateText } from "ai";

export async function POST(request: NextRequest) {
  try {
    const { surname, gender, baziData, style } = await request.json();

    if (!surname || !gender) {
      return NextResponse.json({ error: "请提供姓氏和性别" }, { status: 400 });
    }

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json({
        success: true,
        data: generateMockNames(surname, gender),
      });
    }

    const baziContext = baziData
      ? `\n八字信息：日主${baziData.day_master?.stem}${baziData.day_master?.element}${baziData.day_master?.yang ? "阳" : "阴"}，五行：${JSON.stringify(baziData.five_elements)}。`
      : "";

    const prompt = `你是一位精通中国传统命理学和五行文化的起名专家。请根据以下信息，为一位${gender === "男" ? "男孩" : "女孩"}起名：

姓氏：${surname}${baziContext}
风格偏好：${style || "优雅大气"}

请生成5个中文名字建议（${surname} + 2个字），要求：
1. 每个名字附带五行补益分析和寓意解释
2. 名字要朗朗上口，寓意美好
3. 优先选择五行相生的字，补充八字所缺
4. 返回JSON格式：{"names":[{"name":"张逍遥","wuxing":"木水","score":95,"meaning":"象征自由洒脱，五行相生"}]}
5. 评分1-100分`;

    const result = await generateText({
      model,
      system: "你是专业的起名大师，精通五行八字和汉字寓意。请只返回JSON格式，不要添加其他文字。",
      prompt,
      temperature: 0.9,
    });

    let names;
    try {
      const parsed = JSON.parse(result.text);
      names = parsed.names || [];
    } catch {
      // Try to extract JSON from response
      const jsonMatch = result.text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          names = JSON.parse(jsonMatch[0]).names || [];
        } catch {
          names = [];
        }
      } else {
        names = [];
      }
    }

    if (names.length === 0) {
      names = generateMockNames(surname, gender);
    }

    return NextResponse.json({ success: true, data: names });
  } catch (error) {
    console.error("Naming error:", error);
    return NextResponse.json({ error: "起名服务暂时不可用" }, { status: 500 });
  }
}

function generateMockNames(surname: string, gender: string): any[] {
  const maleNames = [
    { name: `${surname}思远`, wuxing: "金水", score: 92, meaning: "思虑深远，志存高远" },
    { name: `${surname}浩然`, wuxing: "水土", score: 90, meaning: "正气浩然，胸怀宽广" },
    { name: `${surname}文博`, wuxing: "水水", score: 88, meaning: "文采斐然，博学多才" },
    { name: `${surname}子衿`, wuxing: "水木", score: 85, meaning: "温润如玉，品性高雅" },
    { name: `${surname}宇轩`, wuxing: "土木", score: 86, meaning: "气宇轩昂，前程似锦" },
  ];

  const femaleNames = [
    { name: `${surname}婉清`, wuxing: "水水", score: 93, meaning: "温婉清雅，气质如兰" },
    { name: `${surname}诗涵`, wuxing: "金水", score: 91, meaning: "诗书满腹，内涵深厚" },
    { name: `${surname}若兰`, wuxing: "木木", score: 89, meaning: "如兰之馨，品性高洁" },
    { name: `${surname}雨桐`, wuxing: "水木", score: 87, meaning: "梧桐栖凤，雨润心田" },
    { name: `${surname}雪莹`, wuxing: "水土", score: 86, meaning: "冰清玉洁，聪慧明净" },
  ];

  return gender === "男" ? maleNames : femaleNames;
}
