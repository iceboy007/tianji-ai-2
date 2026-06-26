"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface Chart {
  id: string;
  name: string;
  gender: string;
  chartData: any;
  createdAt: string;
}

export default function ReportList() {
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
      <div>
        <h1 className="font-serif-heading text-h3 font-semibold text-foreground-third">
          命理报告
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          请先登录以查看您的历史命理分析报告
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div>
        <h1 className="font-serif-heading text-h3 font-semibold text-foreground-third">
          命理报告
        </h1>
        <div className="mt-8 flex items-center justify-center gap-2 text-muted-foreground">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-border border-t-foreground-primary" />
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif-heading text-h3 font-semibold text-foreground-third">
        命理报告
      </h1>
      <p className="mt-2 text-body text-muted-foreground">
        查看您的历史命理分析报告
      </p>

      {charts.length === 0 ? (
        <div className="mt-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-bg-200">
            <span className="text-2xl">📋</span>
          </div>
          <p className="mt-4 text-body text-muted-foreground">暂无命理报告</p>
          <button
            onClick={() => router.push("/home")}
            className="mt-4 rounded-full bg-button-primary-bg px-6 py-2 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active"
          >
            创建命理档案
          </button>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {charts.map((chart) => (
            <div
              key={chart.id}
              onClick={() => router.push(`/dashboard/${chart.id}`)}
              className="cursor-pointer rounded-xl border border-border bg-card p-4 transition-colors hover:bg-primary-bg-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif-heading font-bold text-foreground-third">
                    {chart.name}
                  </h3>
                  <p className="mt-1 text-body-small text-muted-foreground">
                    {chart.gender === "male" ? "男" : "女"} ·{" "}
                    {new Date(chart.createdAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <span className="text-body-small text-foreground-primary hover:underline">
                  查看详情 →
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
