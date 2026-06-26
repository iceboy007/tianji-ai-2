import { streamText } from "ai";
import { model, buildBaziContext, getTopicPrompt, getSystemPrompt } from "@/lib/ai-service";
import { checkInput, DEFAULT_DISCLAIMER } from "@/lib/safety";
import { logger } from "@/lib/logger";

// 模拟回复（无 API Key 时降级使用）
const FALLBACK_REPLIES: Record<string, string> = {
  "事业": "从命理角度来看，事业发展与个人的五行属性密切相关。您日主五行与流年大运的互动，决定了事业发展的起伏周期。建议关注贵人星所在方位，把握时机。以上分析基于传统命理学，仅供文化娱乐参考。",
  "感情": "感情运势受日柱天干地支影响较大。命中桃花星旺则感情顺遂，但需注意正缘与偏缘的辨别。您可通过日柱与流年的互动，了解感情走势。以上分析基于传统命理学，仅供文化娱乐参考。",
  "财运": "财运方面，八字中的正财和偏财代表了不同的收入来源。正财主稳定收入，偏财主意外之财。命局财星与日主的关系决定了求财的难易程度。以上分析基于传统命理学，仅供文化娱乐参考。",
  "健康": "健康与五行平衡息息相关。命局中某一行过旺或过弱，会对相应脏腑产生影响。建议根据五行偏旺偏衰来调理饮食起居。注意：命理分析仅供参考，身体不适请及时就医。以上分析基于传统命理学，仅供文化娱乐参考。",
  "家庭": "家庭关系的好坏，往往在八字中的比肩和印星中有所体现。印星得力则长辈缘深，比肩和谐则人际关系融洽。家和万事兴。以上分析基于传统命理学，仅供文化娱乐参考。",
  "其他": "您的命盘反映了独特的人生轨迹。一命二运三风水，四积阴德五读书。命运虽有定数，但后天的努力和选择同样重要。以上分析基于传统命理学，仅供文化娱乐参考。",
};

function json(data: object, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
}

export async function POST(req: Request) {
  try {
    const { message, topic, baziData } = await req.json();

    if (!message) {
      return json({ error: "请输入您的问题" }, 400);
    }

    // ─── 安全审核：检查用户输入 ───
    const startTime = Date.now();
    const safetyResult = checkInput(message);
    if (safetyResult.blocked) {
      logger.api("POST", "/api/chat", undefined, Date.now() - startTime);
      return json({ success: true, reply: safetyResult.reason });
    }

    // 检查是否配置了 DeepSeek API Key
    const hasApiKey = !!process.env.DEEPSEEK_API_KEY;

    if (!hasApiKey) {
      const reply = FALLBACK_REPLIES[topic] || FALLBACK_REPLIES["其他"];
      return json({ success: true, reply });
    }

    // 构建提示词（从数据库动态加载）
    const baziContext = baziData ? buildBaziContext(baziData) : "";
    const systemPrompt = await getSystemPrompt();
    const topicPrompt = await getTopicPrompt(topic || "其他");

    // 注入安全免责声明和增强警告
    const safetyNotice = safetyResult.extraWarning
      ? `\n\n⚠️ ${safetyResult.extraWarning}`
      : "";

    const systemMessage = `${systemPrompt}
${safetyNotice}
【重要】每次回复末尾必须包含："${DEFAULT_DISCLAIMER}"

${baziContext ? `\n${baziContext}\n` : ""}
当前用户咨询话题：${topic || "综合"}。${topicPrompt}`;

    // 流式输出
    const result = streamText({
      model,
      system: systemMessage,
      messages: [{ role: "user", content: message }],
      temperature: 0.7,
    });

    logger.api("POST", "/api/chat", undefined, Date.now() - startTime);
    return result.toTextStreamResponse();
  } catch (error) {
    logger.error("/api/chat", error);
    return json({ error: "AI 服务暂时不可用，请稍后重试" }, 500);
  }
}
