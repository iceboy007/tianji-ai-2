# 参天AI (Cantian AI)

AI驱动的中国传统命理分析平台 — 前端克隆项目。

## 技术栈

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4** (Design Token 主题体系)
- **Radix UI Primitives** + **lucide-react**

## 页面路由

| 路由 | 页面 | 说明 |
|------|------|------|
| `/discover` | 灵感大厅 | 首页，每日运势/AI大师/八字入口 |
| `/home` | 八字排盘 | 八字输入表单 |
| `/chat/cantian` | AI对话 | 聊天窗口 |
| `/dashboard/[id]` | 命盘详情 | 六选项卡报告 |
| `/reports` | 档案列表 | 用户档案管理 |
| `/assets` | 内容中心 | 报告图书馆 |
| `/pricing` | 订阅计划 | 七档定价方案 |
| `/account` | 帐号管理 | 用户信息与服务 |

## 本地开发

```bash
npm install
npm run dev
```

Open http://localhost:3000

## 部署

Nginx 反向代理配置已将 80 端口映射到 3000 端口，支持 SSE 流式响应。

## 状态

当前为前端 UI 原型，所有数据为 mock。待实现：认证系统、数据库、八字推算引擎、AI 对话接口。
