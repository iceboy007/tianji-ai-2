/**
 * 内容安全审核模块
 * 三层防护：输入敏感词过滤 → 输出关键词扫描 → 自动追加免责声明
 */

import { logger } from "./logger";

// ─── 拒绝清单：命中直接拒答 ───
const BLOCK_KEYWORDS = [
  // 医疗
  "治病", "开药", "处方", "手术", "诊断书", "治疗", "治愈", "抗癌",
  "中药方", "药方", "把脉", "针灸治",
  // 投资/法律
  "炒股", "买哪只股票", "涨停", "跌停", "内幕", "庄家",
  "官司怎么打", "离婚协议", "遗产分割", "怎么逃税",
  // 赌博/违法
  "彩票号码", "赌", "六合彩", "怎么作弊",
];

// ─── 增强提示清单：命中后追加额外免责 ───
const WARN_KEYWORDS = [
  "感情", "分手", "离婚", "婚姻",
  "跳槽", "辞职", "创业", "炒股",
  "投资", "理财", "买房", "贷款",
];

// ─── AI 输出风险模式 ───
const OUTPUT_RISK_PATTERNS: Array<{ pattern: RegExp; message: string }> = [
  { pattern: /保证.*康复|一定.*治好|绝对.*治愈|肯定.*痊愈/g, message: "健康免责" },
  { pattern: /必涨|稳赚不赔|100%.*收益|保证.*盈利/g, message: "投资免责" },
  { pattern: /肯定.*赢|绝对.*成功|包.*通过/g, message: "确定性免责" },
];

// ─── 检查函数 ───

interface SafetyResult {
  blocked: boolean;
  reason?: string;
  extraWarning?: string;
}

/**
 * 检查用户输入是否触发安全规则
 */
export function checkInput(input: string): SafetyResult {
  const lower = input.toLowerCase();

  // 检查拒绝清单
  for (const kw of BLOCK_KEYWORDS) {
    if (lower.includes(kw)) {
      logger.safety("BLOCKED", `keyword:"${kw}" input:"${input.slice(0, 60)}"`);
      return {
        blocked: true,
        reason: getBlockMessage(kw),
      };
    }
  }

  // 检查增强提示清单
  for (const kw of WARN_KEYWORDS) {
    if (lower.includes(kw)) {
      logger.safety("WARN", `keyword:"${kw}" input:"${input.slice(0, 60)}"`);
      return {
        blocked: false,
        extraWarning: "请注意：以下分析基于传统命理学，仅供文化娱乐参考，不构成任何专业建议。",
      };
    }
  }

  return { blocked: false };
}

/**
 * 扫描 AI 输出，检查是否包含风险断言
 * 返回 { cleaned: 替换后的安全文本, flagged: 是否命中 }
 */
export function scanOutput(text: string): { cleaned: string; flagged: boolean } {
  let flagged = false;
  let cleaned = text;

  for (const { pattern, message } of OUTPUT_RISK_PATTERNS) {
    if (pattern.test(text)) {
      flagged = true;
      logger.safety("WARN", `OUTPUT pattern:${message}`);
      // 重置正则 lastIndex
      pattern.lastIndex = 0;
    }
  }

  // 如果命中风险模式，替换结尾为安全版本
  if (flagged) {
    const safeEnding =
      "\n\n⚠️ 提示：以上分析基于传统命理学，仅供文化娱乐参考。涉及健康、投资、法律等重大决策，请咨询相关专业人士。";
    // 去掉已有的免责结尾（如果有），追加安全版本
    const disclaimerIdx = cleaned.lastIndexOf("以上分析基于传统命理学");
    if (disclaimerIdx > 0) {
      cleaned = cleaned.slice(0, disclaimerIdx) + safeEnding;
    } else {
      cleaned = cleaned + safeEnding;
    }
  }

  return { cleaned, flagged };
}

/**
 * 默认免责声明（每个 AI 回复末尾追加）
 */
export const DEFAULT_DISCLAIMER =
  "以上分析基于传统命理学，仅供文化娱乐参考。涉及健康、投资、法律等重大决策，请咨询相关专业人士。";

// ─── 辅助 ───

function getBlockMessage(keyword: string): string {
  if (/治|药|手术|诊断|癌/.test(keyword)) {
    return "命理分析仅供参考，健康医疗问题请咨询专业医生。";
  }
  if (/股|涨|跌|投资|理财/.test(keyword)) {
    return "命理分析仅供参考，投资理财决策请咨询专业金融顾问。";
  }
  if (/官司|法律|协议/.test(keyword)) {
    return "命理分析仅供参考，法律问题请咨询专业律师。";
  }
  if (/赌|彩票/.test(keyword)) {
    return "天机AI不提供与赌博相关的内容，请选择其他咨询话题。";
  }
  return "该话题涉及专业领域，建议咨询相关专业人士。";
}
