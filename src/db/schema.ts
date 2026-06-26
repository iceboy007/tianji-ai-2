import { pgTable, text, timestamp, serial, integer, jsonb, varchar } from "drizzle-orm/pg-core";

// NextAuth 标准表
export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("email_verified", { mode: "date" }),
  image: text("image"),
  passwordHash: text("password_hash"),
  phone: text("phone"),
  quotaRemaining: integer("quota_remaining").default(10),
  memberType: text("member_type").default("free"),  // free / premium / vip
  memberExpiresAt: timestamp("member_expires_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(),
  provider: text("provider").notNull(),
  providerAccountId: text("provider_account_id").notNull(),
  refreshToken: text("refresh_token"),
  accessToken: text("access_token"),
  expiresAt: integer("expires_at"),
  tokenType: text("token_type"),
  scope: text("scope"),
  idToken: text("id_token"),
  sessionState: text("session_state"),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  sessionToken: text("session_token").unique().notNull(),
  userId: text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable("verification_tokens", {
  identifier: text("identifier").notNull(),
  token: text("token").notNull(),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

// 业务表
export const baziCharts = pgTable("bazi_charts", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  gender: varchar("gender", { length: 10 }).notNull(),
  chartData: jsonb("chart_data").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  chartId: integer("chart_id").references(() => baziCharts.id, { onDelete: "set null" }),
  title: text("title").default("新对话"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => chatSessions.id, { onDelete: "cascade" }),
  role: varchar("role", { length: 20 }).notNull(), // "user" | "assistant"
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// 发现页卡片（管理后台可编辑）
export const discoverCards = pgTable("discover_cards", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").default(""),
  slug: text("slug").notNull(),
  icon: text("icon").default("☰"),
  sortOrder: integer("sort_order").default(0),
  active: integer("active").default(1), // 1=启用, 0=禁用
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// AI 提示词配置（管理后台可编辑）
export const promptConfigs = pgTable("prompt_configs", {
  id: serial("id").primaryKey(),
  key: text("key").unique().notNull(),
  content: text("content").notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// 会员套餐
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").default(""),
  priceCents: integer("price_cents").notNull(), // 价格（分）
  quotaAmount: integer("quota_amount").notNull(), // 赠送额度
  features: text("features").default(""), // JSON 字符串，前端解析
  active: integer("active").default(1),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// 订单
export const orders = pgTable("orders", {
  id: text("id").primaryKey(), // UUID
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  planId: integer("plan_id").references(() => subscriptionPlans.id, { onDelete: "set null" }),
  amountCents: integer("amount_cents").notNull(),
  stripeSessionId: text("stripe_session_id").unique(),
  status: text("status").default("pending"), // pending/paid/cancelled
  paidAt: timestamp("paid_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// AI 记忆管理
export const userMemories = pgTable("user_memories", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  key: text("key").notNull(),       // 记忆类型: preference, personality, history
  value: text("value").notNull(),   // 记忆内容
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// 邀请码系统
export const inviteCodes = pgTable("invite_codes", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  creatorId: text("creator_id").references(() => users.id, { onDelete: "cascade" }),
  usedById: text("used_by_id").references(() => users.id, { onDelete: "set null" }),
  rewardQuota: integer("reward_quota").default(3),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  usedAt: timestamp("used_at", { mode: "date" }),
});

// 礼包码系统
export const giftCodes = pgTable("gift_codes", {
  id: serial("id").primaryKey(),
  code: text("code").unique().notNull(),
  rewardType: text("reward_type").default("quota"), // quota / currency
  rewardAmount: integer("reward_amount").default(10),
  maxUses: integer("max_uses").default(1),           // -1 = 无限
  usedCount: integer("used_count").default(0),
  active: integer("active").default(1),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// 礼包码使用记录
export const giftUsage = pgTable("gift_usage", {
  id: serial("id").primaryKey(),
  codeId: integer("code_id").references(() => giftCodes.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => users.id, { onDelete: "set null" }),
  usedAt: timestamp("used_at", { mode: "date" }).defaultNow(),
});

// 虚拟货币/积分
export const virtualCurrency = pgTable("virtual_currency", {
  id: serial("id").primaryKey(),
  userId: text("user_id").unique().references(() => users.id, { onDelete: "cascade" }),
  balance: integer("balance").default(0),
  totalEarned: integer("total_earned").default(0),
  totalSpent: integer("total_spent").default(0),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// 积分流水
export const currencyTransactions = pgTable("currency_transactions", {
  id: serial("id").primaryKey(),
  userId: text("user_id").references(() => users.id, { onDelete: "cascade" }),
  amount: integer("amount").notNull(),
  type: text("type").notNull(), // earn / spend / exchange
  description: text("description").default(""),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});
