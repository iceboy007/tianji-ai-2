import { createDeepSeek } from "@ai-sdk/deepseek";
import { db } from "@/db";
import { promptConfigs } from "@/db/schema";
import { eq } from "drizzle-orm";

const deepseek = createDeepSeek({
  apiKey: process.env.DEEPSEEK_API_KEY || "",
  baseURL: process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com",
});

export const model = deepseek(
  process.env.DEEPSEEK_MODEL || "deepseek-chat"
);

/**
 * 从数据库动态加载提示词
 */
export async function loadPromptConfigs(): Promise<Record<string, string>> {
  try {
    const configs = await db.select().from(promptConfigs);
    const map: Record<string, string> = {};
    for (const c of configs) {
      map[c.key] = c.content;
    }
    return map;
  } catch {
    return {};
  }
}

// 默认系统提示词（DB 无数据时降级使用）
const DEFAULT_SYSTEM = `你是一位深谙东方命理学的 AI 助手，名字叫"天机"。
核心原则：1. 以八字命盘、五行生克、十神关系为基础 2. 强调决策辅助而非绝对预言 3. 区分传统解释和现实建议。
安全边界：医疗/投资/法律问题需加免责声明。回复风格：温和专业，300-500字，以文化娱乐参考结尾。`;

// 默认话题提示词（DB 无数据时降级使用）
const DEFAULT_TOPIC_PROMPTS: Record<string, string> = {
  "事业": "请围绕事业运势、职业发展方向、贵人运等角度进行分析。",
  "感情": "请围绕感情婚姻运势、桃花运、姻缘匹配等角度进行分析。",
  "财运": "请围绕财运趋势、正财偏财、理财建议等角度进行分析。",
  "健康": "请围绕五行平衡与健康调理、养生建议等角度进行分析。",
  "家庭": "请围绕家庭关系、亲子缘分、长辈关系等角度进行分析。",
};

/**
 * 根据命盘数据构建用户上下文
 */
export function buildBaziContext(baziData: any): string {
  if (!baziData) return "";

  const p = baziData.four_pillars;
  const dm = baziData.day_master;
  const tg = baziData.ten_gods;
  const fe = baziData.five_elements;

  return `【用户命盘信息】
八字：${p.year.name} ${p.month.name} ${p.day.name} ${p.hour.name}
日主：${dm.stem} (${dm.element}，${dm.yang ? "阳" : "阴"})
五行分布：${Object.entries(fe).map(([k, v]) => `${k}${v}`).join(" ")}
十神：年柱${tg.year}、月柱${tg.month}、时柱${tg.hour}
姓名：${baziData.name}，性别：${baziData.gender}
公历生日：${baziData.birth_info.year}年${baziData.birth_info.month}月${baziData.birth_info.day}日
农历生日：${baziData.birth_info.lunar.year}年${baziData.birth_info.lunar.month}月${baziData.birth_info.lunar.day}日`;
}

/**
 * 从 DB 获取话题提示词（DB 无数据时降级到默认值）
 */
export async function getTopicPrompt(topic: string): Promise<string> {
  const configs = await loadPromptConfigs();
  const key = `topic_${topic}`;
  if (configs[key]) return configs[key];
  return DEFAULT_TOPIC_PROMPTS[topic] || "请根据命盘信息进行综合命理分析。";
}

/**
 * 从 DB 获取系统提示词（DB 无数据时降级到默认值）
 */
export async function getSystemPrompt(): Promise<string> {
  const configs = await loadPromptConfigs();
  return configs["system"] || DEFAULT_SYSTEM;
}
