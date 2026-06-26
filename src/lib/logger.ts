/**
 * 操作日志模块
 * 控制台输出 + 文件持久化
 */

function fmt(): string {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function logFile(msg: string) {
  const line = `[${fmt()}] ${msg}`;
  console.log(line);
  // 同时尝试写文件（失败静默）
  try {
    const fs = require("fs");
    const path = require("path");
    const dir = "/tmp/tianji-logs";
    const d = new Date();
    const date = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.appendFileSync(path.join(dir, `tianji-${date}.log`), line + "\n", "utf-8");
  } catch {}
}

export const logger = {
  api(method: string, path: string, userId?: string, duration?: number) {
    const user = userId ? ` user=${userId.slice(0, 8)}` : "";
    const time = duration !== undefined ? ` ${duration}ms` : "";
    logFile(`API ${method} ${path}${user}${time}`);
  },

  action(userId: string, action: string, detail?: string) {
    logFile(`ACTION user=${userId.slice(0, 8)} ${action}${detail ? ` | ${detail}` : ""}`);
  },

  safety(type: "BLOCKED" | "WARN", detail: string) {
    logFile(`SAFETY ${type} ${detail}`);
  },

  error(source: string, err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    logFile(`ERROR ${source} | ${msg}`);
  },
};
