// Placeholder for Bazi Grid component - displays the Four Pillars chart
// Original site displays 4 columns (Year/Month/Day/Hour) × 3 rows (Heavenly Stem/Earthly Branch/Ten Gods)
// with Wu Xing (Five Elements) color coding

const wuxingColors: Record<string, string> = {
  "金": "text-yellow-600 bg-yellow-50",
  "木": "text-green-600 bg-green-50",
  "水": "text-blue-600 bg-blue-50",
  "火": "text-red-600 bg-red-50",
  "土": "text-amber-600 bg-amber-50",
};

interface PillarData {
  stem: string;
  branch: string;
  tenGod: string;
  wuxing: string;
  nianYin?: string;
}

interface BaziGridProps {
  year: PillarData;
  month: PillarData;
  day: PillarData;
  hour: PillarData;
  dayMaster?: string;
}

const defaultPillar: PillarData = {
  stem: "甲",
  branch: "子",
  tenGod: "比肩",
  wuxing: "木",
  nianYin: "海中金",
};

export default function BaziGrid({
  year = defaultPillar,
  month = { ...defaultPillar, stem: "丙", branch: "寅" },
  day = { ...defaultPillar, stem: "戊", branch: "午", tenGod: "日主" },
  hour = { ...defaultPillar, stem: "庚", branch: "申" },
  dayMaster = "戊",
}: Partial<BaziGridProps>) {
  const pillars = [
    { label: "年柱", ...year },
    { label: "月柱", ...month },
    { label: "日柱", ...day },
    { label: "时柱", ...hour },
  ];

  const rows = [
    { label: "天干", key: "stem" as const },
    { label: "地支", key: "branch" as const },
    { label: "十神", key: "tenGod" as const },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="p-2"></th>
            {pillars.map((p) => (
              <th
                key={p.label}
                className="p-2 text-center font-serif-heading text-body-small text-foreground-third"
              >
                {p.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td className="p-2 text-center text-body-small text-muted-foreground">
                {row.label}
              </td>
              {pillars.map((p) => {
                const isDayMaster =
                  row.key === "tenGod" && p.label === "日柱";
                const value = p[row.key];
                const colorClass =
                  row.key === "stem" || row.key === "branch"
                    ? wuxingColors[p.wuxing] || ""
                    : "";
                return (
                  <td
                    key={p.label}
                    className={`p-2 text-center ${
                      isDayMaster
                        ? "bg-primary-bg-400 font-bold"
                        : ""
                    }`}
                  >
                    <span
                      className={`inline-flex h-10 w-10 items-center justify-center rounded-md font-serif-heading text-body ${
                        row.key === "tenGod"
                          ? "text-tip-small text-muted-foreground"
                          : colorClass
                      }`}
                    >
                      {value}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Nian Yin Row */}
          <tr>
            <td className="p-2 text-center text-tip-small text-muted-foreground">
              纳音
            </td>
            {pillars.map((p) => (
              <td
                key={p.label}
                className="p-2 text-center text-tip-small text-muted-foreground"
              >
                {p.nianYin || "海中金"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
