"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FileText, Trash2 } from "lucide-react";

interface Chart {
  id: string;
  name: string;
  gender: string;
  chartData: any;
  createdAt: string;
}

const typeColors: Record<string, string> = {
  "个性报告": "bg-blue-50 text-blue-600",
  "人生总览": "bg-purple-50 text-purple-600",
  "年度报告": "bg-gradient-to-r from-pink-500 via-orange-500 to-yellow-500 text-white",
  "事业报告": "bg-green-50 text-green-600",
  命理档案: "bg-amber-50 text-amber-600",
};

export default function AssetsContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [charts, setCharts] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/user/charts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setCharts(data.data);
          }
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <p className="text-body text-muted-foreground">请先登录以查看内容</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground-primary" />
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="font-serif-heading text-h2 font-bold text-foreground-third">
        我的内容
      </h1>

      {charts.length === 0 ? (
        <div className="py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-bg-200">
            <FileText className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-4 text-body text-muted-foreground">暂无内容</p>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 rounded-full bg-button-primary-bg px-6 py-2 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active"
          >
            创建命理档案
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {charts.map((chart) => (
            <div
              key={chart.id}
              onClick={() => router.push(`/dashboard/${chart.id}`)}
              className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:bg-primary-bg-100"
            >
              <div className="flex items-start justify-between">
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-tip-small font-medium ${
                    typeColors["命理档案"] || "bg-gray-100 text-gray-600"
                  }`}
                >
                  命理档案
                </span>
              </div>
              <div className="mt-2 text-tip-small text-muted-foreground">
                {new Date(chart.createdAt).toLocaleDateString("zh-CN")}
              </div>
              <div className="mt-1 font-serif-heading font-bold text-foreground-third">
                {chart.name}
              </div>
              <p className="mt-2 line-clamp-2 text-body-small text-text-secondary">
                {chart.gender === "male" ? "男" : "女"} ·{" "}
                {chart.chartData?.day_master || "命理档案"}
              </p>
              <span className="mt-3 inline-block text-body-small text-foreground-primary hover:underline">
                查看详情
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
