"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BaziGrid from "@/components/bazi/BaziGrid";

interface DashboardContentProps {
  reportId: string;
}

interface ChartData {
  name: string;
  gender: string;
  chartData: any;
  createdAt: string;
}

interface DayunData {
  dayun_list: { stem: string; branch: string; age: string }[];
  start_age: number;
}

const tabs = [
  "基本信息",
  "大运流年",
  "咨询AI",
];

const zodiacMap: Record<string, string> = {
  子: "🐭", 丑: "🐮", 寅: "🐯", 卯: "🐰",
  辰: "🐲", 巳: "🐍", 午: "🐴", 未: "🐑",
  申: "🐵", 酉: "🐔", 戌: "🐶", 亥: "🐷",
};

const nayinMap: Record<string, string> = {
  甲子: "海中金", 乙丑: "海中金", 丙寅: "炉中火", 丁卯: "炉中火",
  戊辰: "大林木", 己巳: "大林木", 庚午: "路旁土", 辛未: "路旁土",
  壬申: "剑锋金", 癸酉: "剑锋金", 甲戌: "山头火", 乙亥: "山头火",
  丙子: "涧下水", 丁丑: "涧下水", 戊寅: "城头土", 己卯: "城头土",
  庚辰: "白蜡金", 辛巳: "白蜡金", 壬午: "杨柳木", 癸未: "杨柳木",
  甲申: "泉中水", 乙酉: "泉中水", 丙戌: "屋上土", 丁亥: "屋上土",
  戊子: "霹雳火", 己丑: "霹雳火", 庚寅: "松柏木", 辛卯: "松柏木",
  壬辰: "长流水", 癸巳: "长流水", 甲午: "沙中金", 乙未: "沙中金",
  丙申: "山下火", 丁酉: "山下火", 戊戌: "平地木", 己亥: "平地木",
  庚子: "壁上土", 辛丑: "壁上土", 壬寅: "金箔金", 癸卯: "金箔金",
  甲辰: "覆灯火", 乙巳: "覆灯火", 丙午: "天河水", 丁未: "天河水",
  戊申: "大驿土", 己酉: "大驿土", 庚戌: "钗钏金", 辛亥: "钗钏金",
  壬子: "桑柘木", 癸丑: "桑柘木", 甲寅: "大溪水", 乙卯: "大溪水",
  丙辰: "沙中土", 丁巳: "沙中土", 戊午: "天上火", 己未: "天上火",
  庚申: "石榴木", 辛酉: "石榴木", 壬戌: "大海水", 癸亥: "大海水",
};

export default function DashboardContent({ reportId }: DashboardContentProps) {
  const [activeTab, setActiveTab] = useState("基本信息");
  const [chart, setChart] = useState<ChartData | null>(null);
  const [dayun, setDayun] = useState<DayunData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/user/charts`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          const found = data.data.find((c: any) => c.id === reportId);
          if (found) {
            setChart(found);
            const baziInfo = {
              year: found.chartData?.year?.stem + found.chartData?.year?.branch || "",
              month: found.chartData?.month?.stem + found.chartData?.month?.branch || "",
              day: found.chartData?.day?.stem + found.chartData?.day?.branch || "",
              hour: found.chartData?.hour?.stem + found.chartData?.hour?.branch || "",
            };
            fetch("/api/bazi/dayun", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(found.chartData),
            })
              .then((res) => res.json())
              .then((d) => {
                if (d.success) setDayun(d.data);
              })
              .catch(() => {});
          }
        }
      })
      .catch(() => setError("加载失败"))
      .finally(() => setLoading(false));
  }, [reportId]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground-primary" />
          加载中...
        </div>
      </div>
    );
  }

  if (error || !chart) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <p className="text-body text-muted-foreground">{error || "未找到档案"}</p>
          <Link
            href="/reports"
            className="mt-4 inline-block text-body text-foreground-primary hover:underline"
          >
            返回档案列表
          </Link>
        </div>
      </div>
    );
  }

  const { chartData } = chart;
  const dayMaster = chartData?.day_master || (chartData?.day?.stem + chartData?.day?.branch || "");
  const genderLabel = chart.gender === "male" ? "男" : "女";
  const yearPillar = (chartData?.year?.stem || "") + (chartData?.year?.branch || "");
  const nayin = nayinMap[yearPillar] || "";
  const yearZodiac = chartData?.year?.branch || "";
  const zodiacEmoji = zodiacMap[yearZodiac] || "🐉";

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
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-bg-200 text-2xl">
            {zodiacEmoji}
          </div>
          <div>
            <h2 className="font-serif-heading text-h5 font-bold text-foreground-third">
              {chart.name}
            </h2>
            <p className="text-body-small text-text-secondary">
              {genderLabel} · {dayMaster} · {nayin || "命"}
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 border-b border-border bg-card/75 backdrop-blur z-10">
        <div className="flex overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`relative shrink-0 px-4 py-3 font-serif-heading text-body font-medium transition-colors ${
                activeTab === tab
                  ? "text-foreground-primary border-b-2 border-foreground-primary"
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

            {/* Five Elements */}
            {chartData?.five_elements && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                  五行强弱
                </h3>
                <div className="mt-3 space-y-2">
                  {[
                    { element: "金", value: chartData.five_elements["金"] || 0, color: "bg-yellow-400" },
                    { element: "木", value: chartData.five_elements["木"] || 0, color: "bg-green-400" },
                    { element: "水", value: chartData.five_elements["水"] || 0, color: "bg-blue-400" },
                    { element: "火", value: chartData.five_elements["火"] || 0, color: "bg-red-400" },
                    { element: "土", value: chartData.five_elements["土"] || 0, color: "bg-amber-400" },
                  ].map((item) => (
                    <div key={item.element} className="flex items-center gap-3">
                      <span className="w-8 text-body-small font-medium text-foreground-second">
                        {item.element}
                      </span>
                      <div className="flex-1 h-3 rounded-full bg-primary-bg-200">
                        <div
                          className={`h-full rounded-full ${item.color}`}
                          style={{ width: `${Math.min(item.value, 100)}%` }}
                        />
                      </div>
                      <span className="w-10 text-right text-tip-small text-muted-foreground">
                        {item.value}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Shen Sha */}
            {chartData?.shensha && chartData.shensha.length > 0 && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                  神煞
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {chartData.shensha.map((s: string) => (
                    <span
                      key={s}
                      className="rounded-md bg-primary-bg-200 px-3 py-1 text-body-small text-foreground-third"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Day Master */}
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                日主
              </h3>
              <p className="mt-2 text-body text-foreground-second">
                {dayMaster}
              </p>
            </div>

            {/* Nayin */}
            {nayin && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                  纳音
                </h3>
                <p className="mt-2 text-body text-foreground-second">
                  {nayin}
                </p>
              </div>
            )}

            {/* Da Yun Start Age */}
            {dayun?.start_age != null && (
              <div className="rounded-xl border border-border bg-card p-4">
                <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                  大运起运
                </h3>
                <p className="mt-2 text-body text-foreground-second">
                  起运年龄：{dayun.start_age}岁
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "大运流年" && (
          <div className="space-y-6">
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                大运
              </h3>
              <div className="mt-3 flex gap-3 overflow-x-auto pb-2">
                {dayun?.dayun_list && dayun.dayun_list.length > 0 ? (
                  dayun.dayun_list.map((d, i) => {
                    const startAge = parseInt(d.age);
                    return (
                      <div
                        key={i}
                        className="shrink-0 rounded-lg border border-border bg-primary-bg-100 px-4 py-2 text-center text-body-small font-serif-heading text-foreground-third"
                      >
                        {d.age}岁 {d.stem}{d.branch}
                      </div>
                    );
                  })
                ) : (
                  <p className="text-body-small text-muted-foreground">暂无大运数据</p>
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
