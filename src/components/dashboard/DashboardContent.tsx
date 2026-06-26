"use client";

import { useState } from "react";
import Link from "next/link";
import BaziGrid from "@/components/bazi/BaziGrid";

interface DashboardContentProps {
  reportId: string;
}

const tabs = [
  "咨询AI",
  "基本信息",
  "大运流年",
  "年度报告",
  "个性报告",
  "深度报告",
];

export default function DashboardContent({ reportId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("基本信息");

  return (
    <div className="flex h-full flex-col bg-primary-bg-100">
      {/* Breadcrumb */}
      <div className="border-b border-border bg-card px-4 py-2">
        <nav className="font-serif-heading text-body-small">
          <Link href="/reports" className="text-muted-foreground hover:text-foreground-primary">
            档案列表
          </Link>
          <span className="mx-2 text-muted-foreground">&gt;</span>
          <span className="font-bold text-foreground-third">档案详情</span>
        </nav>
      </div>

      {/* Profile Summary Card */}
      <div className="border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Placeholder zodiac - original: /images/chinese-zodiac/{zodiac}@2x.png */}
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-bg-200 text-2xl">
            🐲
          </div>
          <div>
            <h2 className="font-serif-heading text-h5 font-bold text-foreground-third">
              张三
            </h2>
            <p className="text-body-small text-text-secondary">
              男 · 1990-01-01 · 海中金命
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 border-b border-border bg-card/75 backdrop-blur">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 px-4 py-3 font-serif-heading text-body font-medium transition-colors ${
                activeTab === tab
                  ? tab === "年度报告"
                    ? "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 bg-clip-text text-transparent border-b-2 border-foreground-primary"
                    : "text-foreground-primary border-b-2 border-foreground-primary"
                  : "text-foreground-second hover:text-foreground-primary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {activeTab === "基本信息" && (
          <div className="space-y-6">
            <BaziGrid />

            {/* Five Elements Analysis */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                五行强弱
              </h3>
              <div className="mt-3 space-y-2">
                {[
                  { element: "金", value: 60, color: "bg-yellow-400" },
                  { element: "木", value: 30, color: "bg-green-400" },
                  { element: "水", value: 45, color: "bg-blue-400" },
                  { element: "火", value: 70, color: "bg-red-400" },
                  { element: "土", value: 55, color: "bg-amber-400" },
                ].map((item) => (
                  <div key={item.element} className="flex items-center gap-3">
                    <span className="w-8 text-body-small font-medium text-foreground-second">
                      {item.element}
                    </span>
                    <div className="flex-1 h-3 rounded-full bg-primary-bg-200">
                      <div
                        className={`h-full rounded-full ${item.color}`}
                        style={{ width: `${item.value}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-tip-small text-muted-foreground">
                      {item.value}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Shen Sha */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                神煞
              </h3>
              <div className="mt-2 flex flex-wrap gap-2">
                {["天乙贵人", "文昌贵人", "驿马", "桃花"].map((shensha) => (
                  <span
                    key={shensha}
                    className="rounded-md bg-primary-bg-200 px-3 py-1 text-body-small text-foreground-third"
                  >
                    {shensha}
                  </span>
                ))}
              </div>
            </div>

            {/* Pattern */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                格局
              </h3>
              <p className="mt-2 text-body text-foreground-second">
                正官格
              </p>
            </div>

            {/* Da Yun Start Age */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                大运起运
              </h3>
              <p className="mt-2 text-body text-foreground-second">
                起运年龄：8岁
              </p>
            </div>
          </div>
        )}

        {activeTab === "大运流年" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                大运
              </h3>
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {["8-17岁 甲戌", "18-27岁 癸酉", "28-37岁 壬申", "38-47岁 辛未", "48-57岁 庚午"].map(
                  (dayun) => (
                    <div
                      key={dayun}
                      className="shrink-0 rounded-lg border border-border bg-primary-bg-100 px-4 py-2 text-center text-body-small font-serif-heading text-foreground-third"
                    >
                      {dayun}
                    </div>
                  )
                )}
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                流年
              </h3>
              <div className="mt-3 overflow-x-auto">
                <div className="grid grid-cols-10 gap-1">
                  {Array.from({ length: 100 }, (_, i) => {
                    const stems = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
                    const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
                    return (
                      <div
                        key={i}
                        className="rounded p-1 text-center text-tip-small font-serif-heading hover:bg-primary-bg-200"
                      >
                        {stems[i % 10] + branches[i % 12]}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {(activeTab === "个性报告" || activeTab === "深度报告" || activeTab === "年度报告") && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-border bg-card p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-bg-200">
                <span className="text-2xl">🔒</span>
              </div>
              <h3 className="mt-4 font-serif-heading text-h5 font-bold text-foreground-third">
                解锁{activeTab}
              </h3>
              <p className="mt-2 text-body-small text-text-secondary">
                使用参天石或订阅会员即可解锁深度分析报告
              </p>
              <div className="mt-4 flex items-center justify-center gap-2">
                <span className="text-h4 font-bold text-foreground-primary">5</span>
                <span className="text-body-small text-text-secondary">参天石</span>
              </div>
              <button className="mt-4 rounded-full bg-button-primary-bg px-8 py-2.5 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active">
                立即解锁
              </button>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="prose prose-sm max-w-none">
                <h2 className="font-serif-heading text-h5 font-bold text-foreground-third">
                  个性分析报告
                </h2>
                <p className="mt-2 text-body text-foreground-second">
                  您的命盘显示，日主为戊土，生于午月，火旺土相。戊土为城墙之土，厚重诚实...
                </p>
                <h3 className="mt-4 font-serif-heading text-h4 font-bold text-foreground-third">
                  性格特点
                </h3>
                <ul className="mt-2 space-y-1">
                  <li className="text-body text-foreground-second">稳重踏实，责任心强</li>
                  <li className="text-body text-foreground-second">待人真诚，值得信赖</li>
                  <li className="text-body text-foreground-second">善于规划，执行力强</li>
                </ul>
                <div className="mt-4 rounded-lg bg-primary-bg-100 p-4">
                  <p className="font-serif-heading text-h5 font-bold text-foreground-primary">
                    综合评分：85分
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "咨询AI" && (
          <div className="flex h-full items-center justify-center">
            <Link
              href="/chat/cantian"
              className="rounded-full bg-button-primary-bg px-8 py-3 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active"
            >
              开始AI对话
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
