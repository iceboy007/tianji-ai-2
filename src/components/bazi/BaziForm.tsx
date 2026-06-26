"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface BaziResult {
  name: string;
  gender: string;
  four_pillars: {
    year: { name: string; stem: string; branch: string; wuxing: string; nianYin?: string };
    month: { name: string; stem: string; branch: string; wuxing: string; nianYin?: string };
    day: { name: string; stem: string; branch: string; wuxing: string; nianYin?: string };
    hour: { name: string; stem: string; branch: string; wuxing: string; nianYin?: string };
  };
  day_master: { stem: string; element: string; yang: boolean };
  ten_gods: { year: string; month: string; day: string; hour: string };
  five_elements: Record<string, number>;
  shi_shen?: string[];
  dayun?: Array<{ stem: string; branch: string; startAge: number; endAge: number }>;
}

export default function BaziForm() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<BaziResult | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    gender: "男",
    year: 1990,
    month: 1,
    day: 1,
    hour: 12,
    birthplace: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "month" || name === "day" || name === "hour"
        ? parseInt(value) || 0
        : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/bazi/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success && data.data) {
        setResult(data.data);

        // If logged in, save chart
        if (session?.user) {
          await fetch("/api/user/charts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: formData.name,
              gender: formData.gender,
              chartData: data.data,
            }),
          });
        }
      } else {
        setError(data.error || "排盘失败，请重试");
      }
    } catch {
      setError("网络错误，请检查服务是否可用");
    } finally {
      setLoading(false);
    }
  };

  const wuxingColors: Record<string, string> = {
    "金": "text-yellow-600 bg-yellow-50",
    "木": "text-green-600 bg-green-50",
    "水": "text-blue-600 bg-blue-50",
    "火": "text-red-600 bg-red-50",
    "土": "text-amber-600 bg-amber-50",
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h2 className="font-serif-heading text-h3 font-bold text-foreground-third">
        八字排盘
      </h2>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-body-small text-foreground-second mb-1">姓名</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="请输入姓名"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-body-small text-foreground-second mb-1">性别</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
            >
              <option value="男">男</option>
              <option value="女">女</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="block text-body-small text-foreground-second mb-1">年</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min={1900}
              max={2100}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-body-small text-foreground-second mb-1">月</label>
            <input
              type="number"
              name="month"
              value={formData.month}
              onChange={handleChange}
              min={1}
              max={12}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-body-small text-foreground-second mb-1">日</label>
            <input
              type="number"
              name="day"
              value={formData.day}
              onChange={handleChange}
              min={1}
              max={31}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
              required
            />
          </div>
          <div>
            <label className="block text-body-small text-foreground-second mb-1">时</label>
            <input
              type="number"
              name="hour"
              value={formData.hour}
              onChange={handleChange}
              min={0}
              max={23}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-body-small text-foreground-second mb-1">出生地（选填）</label>
          <input
            type="text"
            name="birthplace"
            value={formData.birthplace}
            onChange={handleChange}
            placeholder="如：北京"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-body text-foreground-second outline-none focus:border-border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-full bg-button-primary-bg py-3 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active disabled:opacity-50"
        >
          {loading ? "计算中..." : "免费生成八字报告"}
        </button>

        <p className="text-center text-tip-small text-muted-foreground">
          免费生成八字报告需要消耗1个消息额度
        </p>

        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-body-small text-red-600">
            {error}
          </div>
        )}
      </form>

      {/* Result Display */}
      {result && (
        <div className="space-y-6">
          {/* Four Pillars Table */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="font-serif-heading text-h5 font-bold text-foreground-third mb-4">
              {result.name} · {result.gender} · 八字四柱
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="p-2"></th>
                    <th className="p-2 text-center font-serif-heading text-body-small text-foreground-third">年柱</th>
                    <th className="p-2 text-center font-serif-heading text-body-small text-foreground-third">月柱</th>
                    <th className="p-2 text-center font-serif-heading text-body-small text-foreground-third">日柱</th>
                    <th className="p-2 text-center font-serif-heading text-body-small text-foreground-third">时柱</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "天干", key: "stem" as const },
                    { label: "地支", key: "branch" as const },
                  ].map((row) => (
                    <tr key={row.key}>
                      <td className="p-2 text-center text-body-small text-muted-foreground">{row.label}</td>
                      {(["year", "month", "day", "hour"] as const).map((pillar) => {
                        const p = result.four_pillars[pillar];
                        const color = wuxingColors[p.wuxing] || "";
                        return (
                          <td key={pillar} className="p-2 text-center">
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-md font-serif-heading text-body ${color}`}>
                              {p[row.key]}
                            </span>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                  <tr>
                    <td className="p-2 text-center text-body-small text-muted-foreground">十神</td>
                    {(["year", "month", "day", "hour"] as const).map((pillar) => (
                      <td key={pillar} className="p-2 text-center">
                        <span className="text-tip-small text-muted-foreground">
                          {result.ten_gods[pillar]}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="p-2 text-center text-tip-small text-muted-foreground">纳音</td>
                    {(["year", "month", "day", "hour"] as const).map((pillar) => (
                      <td key={pillar} className="p-2 text-center text-tip-small text-muted-foreground">
                        {result.four_pillars[pillar].nianYin || "-"}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Day Master */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">日主</h3>
            <p className="mt-2 text-body text-foreground-second">
              {result.day_master.stem} ({result.day_master.element}，{result.day_master.yang ? "阳" : "阴"})
            </p>
          </div>

          {/* Five Elements */}
          <div className="rounded-xl border border-border bg-card p-4">
            <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">五行分布</h3>
            <div className="mt-3 space-y-2">
              {Object.entries(result.five_elements).map(([element, count]) => (
                <div key={element} className="flex items-center gap-3">
                  <span className="w-8 text-body-small font-medium text-foreground-second">{element}</span>
                  <div className="flex-1 h-3 rounded-full bg-primary-bg-200">
                    <div
                      className={`h-full rounded-full ${wuxingColors[element] || "bg-gray-400"}`}
                      style={{ width: `${Math.min(count * 25, 100)}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-tip-small text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dayun */}
          {result.dayun && result.dayun.length > 0 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">大运</h3>
              <div className="mt-3 flex gap-3 overflow-x-auto">
                {result.dayun.map((d, i) => (
                  <div
                    key={i}
                    className="shrink-0 rounded-lg border border-border bg-primary-bg-100 px-4 py-2 text-center text-body-small font-serif-heading text-foreground-third"
                  >
                    <span className="block text-tip-small text-muted-foreground">{d.startAge}-{d.endAge}岁</span>
                    {d.stem}{d.branch}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/chat/cantian")}
              className="flex-1 rounded-full bg-button-primary-bg py-2.5 text-body font-medium text-button-foreground hover:bg-button-primary-bg-active"
            >
              咨询AI
            </button>
            <button
              onClick={() => setResult(null)}
              className="rounded-full border border-border bg-card px-6 py-2.5 text-body text-foreground-second hover:bg-primary-bg-100"
            >
              重新排盘
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
