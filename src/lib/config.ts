/**
 * 前端部署地址常量
 * 环境变量 NEXT_PUBLIC_URL 优先，否则使用默认值
 */
export const DEPLOY_URL =
  process.env.NEXT_PUBLIC_URL || "http://101.34.84.188";

export const SITE_NAME = "天机AI";
export const SITE_DESCRIPTION = "AI 命理解读与人生规划助手";
