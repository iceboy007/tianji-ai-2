"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  LayoutGrid,
  CircleDollarSign,
  Gift,
  PanelLeft,
  Languages,
  ChevronRight,
} from "lucide-react";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: Sparkles, label: "灵感大厅", href: "/discover" },
  { icon: LayoutGrid, label: "八字排盘", href: "/home" },
  { icon: CircleDollarSign, label: "订阅计划", href: "/pricing" },
  { icon: Gift, label: "限时好礼", href: "#" },
];

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  if (collapsed) return null;

  return (
    <div className="flex h-full flex-col">
      {/* Logo Area */}
      <div className="flex h-12 items-center justify-between px-4">
        {/* Placeholder for logo - original: /images/logo/logo-en.svg */}
        <Link href="/discover" className="font-serif-heading text-h5 font-bold text-foreground-third">
          参天AI
        </Link>
        <button
          onClick={onToggle}
          className="flex h-9 w-9 cursor-w-resize items-center justify-center rounded-xl transition-colors hover:bg-primary-bg-100"
          aria-label="Toggle sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </button>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 overflow-y-hidden px-4 pt-3">
        <div className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex cursor-pointer items-center gap-3 rounded-lg px-3 py-1 text-body-small transition-colors hover:bg-menu-active-bg ${
                  isActive
                    ? "bg-[#e6b0584d] text-menu-active-fg"
                    : "text-menu-fg"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Session History (logged in only) */}
        {isLoggedIn && (
          <div className="mt-4 border-t border-border pt-4">
            <h3 className="px-3 text-tip-small text-muted-foreground">
              会话记录
            </h3>
            <div className="mt-2 space-y-1">
              <div className="cursor-pointer truncate rounded-lg px-3 py-1 text-body-small text-menu-fg transition-colors hover:bg-menu-active-bg">
                最近的命理咨询...
              </div>
              <Link
                href="/chat/cantian"
                className="block px-3 text-body-small text-foreground-primary hover:underline"
              >
                查看全部
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Promotional Area */}
      <div className="px-4 py-2 space-y-2">
        <button className="w-full rounded-lg border border-border-primary-light bg-card px-3 py-2 text-center text-body-small text-foreground-third transition-colors hover:bg-primary-bg-100">
          {/* Original: /images/sidebar/master-blessing-icon.png */}
          🎁 分享领取大礼包
        </button>
        <button className="w-full rounded-lg border border-border-primary-light bg-card px-3 py-2 text-center text-body-small text-foreground-third transition-colors hover:bg-primary-bg-100">
          🙏 专属祈福定制
        </button>
      </div>

      {/* Bottom User Area */}
      <div className="border-t border-border p-3 px-4 space-y-3">
        {/* Language Selector */}
        <button className="flex w-full items-center justify-between rounded-lg px-2 py-1 text-body-small text-menu-fg transition-colors hover:bg-primary-bg-100">
          <div className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            <span className="text-muted-foreground">系统语言</span>
          </div>
          <div className="flex items-center gap-1">
            <span>简体中文</span>
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          </div>
        </button>

        {/* Not Logged In - Login Card */}
        {!isLoggedIn ? (
          <div className="rounded-2xl border border-[#EAE2D5] px-4 py-3 text-center"
               style={{ background: "linear-gradient(135deg, #FCFAF8 0%, #F5F0E8 100%)" }}>
            <h4 className="font-serif-heading font-semibold text-foreground-third">
              开启智慧探索
            </h4>
            <p className="mt-1 text-tip-small text-muted-foreground">
              登录以同步您的档案与聊天记录
            </p>
            <button
              onClick={() => setIsLoggedIn(true)}
              className="mt-2 h-10 w-full rounded-full border border-primary px-4 text-body-small font-medium text-button-foreground transition-colors hover:bg-accent"
            >
              登录/注册
            </button>
          </div>
        ) : (
          /* Logged In - User Info */
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              {/* Placeholder for zodiac image - original: /images/chinese-zodiac/{zodiac}@2x.png */}
              <div className="h-8 w-8 rounded-full border border-border bg-primary-bg-200 flex items-center justify-center text-tip-small">
                🐉
              </div>
              <div>
                <div className="text-body-small font-medium text-menu-fg">
                  张三
                </div>
                <div className="text-tip-small text-muted-foreground">
                  男 · 1990-01-01
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {/* Placeholder for coins icon - original: /images/coins.png */}
                <span className="text-body-small">⭐</span>
                <span className="text-body-small font-medium text-menu-fg">
                  100
                </span>
              </div>
              <span className="rounded-full bg-primary-bg-200 px-2 py-0.5 text-tip-small text-foreground-primary">
                免费用户
              </span>
            </div>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="text-tip-small text-muted-foreground hover:underline"
            >
              退出登录
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
