"use client";

import { useState } from "react";
import { FileText, Trash2 } from "lucide-react";

interface AssetItem {
  id: string;
  type: string;
  profileName: string;
  generatedAt: string;
  summary: string;
}

const mockAssets: AssetItem[] = [
  {
    id: "1",
    type: "个性报告",
    profileName: "张三",
    generatedAt: "2026-06-25",
    summary: "您的个性报告显示您是一个富有创造力、性格开朗的人，在人际交往中表现出色...",
  },
  {
    id: "2",
    type: "人生总览",
    profileName: "张三",
    generatedAt: "2026-06-24",
    summary: "您的人生运势呈现出先抑后扬的态势，中年之后将迎来事业和财富的双重丰收...",
  },
  {
    id: "3",
    type: "2026年度报告",
    profileName: "李四",
    generatedAt: "2026-06-23",
    summary: "2026年对您来说将是充满机遇的一年，特别是在事业发展和人际关系方面...",
  },
  {
    id: "4",
    type: "事业报告",
    profileName: "王五",
    generatedAt: "2026-06-22",
    summary: "您的事业发展方向非常适合创业和自主经营，建议关注科技和创意产业...",
  },
];

const tabs = [
  "全部",
  "个性报告",
  "人生总览",
  "年度报告",
  "事业",
  "婚恋",
  "财富",
];

const typeBadgeColors: Record<string, string> = {
  "个性报告": "bg-blue-50 text-blue-600",
  "人生总览": "bg-purple-50 text-purple-600",
  "2026年度报告": "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 text-white",
  "事业报告": "bg-green-50 text-green-600",
};

export default function AssetsContent() {
  const [activeTab, setActiveTab] = useState("全部");

  const filteredAssets =
    activeTab === "全部"
      ? mockAssets
      : mockAssets.filter((a) => a.type === activeTab);

  return (
    <div className="space-y-6">
      <h1 className="font-serif-heading text-h2 font-bold text-foreground-third">
        我的内容
      </h1>

      {/* Tab Filter */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-lg px-4 py-1.5 text-body-small transition-colors ${
              activeTab === tab
                ? "bg-button-primary-bg text-button-foreground font-medium"
                : "bg-card border border-border text-foreground-second hover:bg-primary-bg-100"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content Cards Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-border bg-card p-4 transition-colors hover:bg-primary-bg-100"
          >
            <div className="flex items-start justify-between">
              <span
                className={`inline-block rounded-md px-2 py-0.5 text-tip-small font-medium ${
                  typeBadgeColors[asset.type] || "bg-gray-100 text-gray-600"
                }`}
              >
                {asset.type}
              </span>
              <button className="rounded p-1 text-muted-foreground transition-colors hover:bg-primary-bg-200 hover:text-red-500">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-2 text-tip-small text-muted-foreground">
              {asset.generatedAt}
            </div>
            <div className="mt-1 font-serif-heading font-bold text-foreground-third">
              {asset.profileName}
            </div>
            <p className="mt-2 line-clamp-2 text-body-small text-text-secondary">
              {asset.summary}
            </p>
            <button className="mt-3 text-body-small text-foreground-primary hover:underline">
              查看全文
            </button>
          </div>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="py-12 text-center text-muted-foreground">
          暂无内容
        </div>
      )}
    </div>
  );
}
