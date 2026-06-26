export default function AgentCards() {
  return (
    <section className="mb-8">
      <h2 className="font-serif-heading text-h4 font-semibold text-foreground-third">
        AI智能体
      </h2>
      <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-serif-heading text-body-medium font-semibold text-foreground-third">
            八字命理师
          </h3>
          <p className="mt-1 text-body-small text-muted-foreground">
            专业八字排盘与命理分析
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-serif-heading text-body-medium font-semibold text-foreground-third">
            风水顾问
          </h3>
          <p className="mt-1 text-body-small text-muted-foreground">
            家居与办公风水布局建议
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <h3 className="font-serif-heading text-body-medium font-semibold text-foreground-third">
            择日大师
          </h3>
          <p className="mt-1 text-body-small text-muted-foreground">
            黄道吉日查询与选择
          </p>
        </div>
      </div>
    </section>
  );
}
