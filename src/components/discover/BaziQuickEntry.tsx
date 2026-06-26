export default function BaziQuickEntry() {
  return (
    <section className="mb-8 rounded-2xl border border-border bg-card p-6">
      <h2 className="font-serif-heading text-h4 font-semibold text-foreground-third">
        快速排盘
      </h2>
      <p className="mt-2 text-body text-muted-foreground">
        输入您的出生信息，即刻获取八字命盘
      </p>
      <div className="mt-4 flex gap-3">
        <input
          type="text"
          placeholder="姓名"
          className="rounded-lg border border-border px-3 py-2 text-body-small"
        />
        <input
          type="date"
          className="rounded-lg border border-border px-3 py-2 text-body-small"
        />
        <button className="rounded-lg bg-button-primary-bg px-4 py-2 text-body-small font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active">
          开始排盘
        </button>
      </div>
    </section>
  );
}
