export default function LoginUnlock() {
  return (
    <section className="mb-8 rounded-2xl border border-border-primary-200 bg-accent p-8 text-center">
      <h2 className="font-serif-heading text-h3 font-semibold text-accent-title">
        登录解锁更多功能
      </h2>
      <p className="mt-2 text-body text-muted-foreground">
        登录后可保存您的命盘记录，获取个性化推荐
      </p>
      <button className="mt-4 rounded-full border border-primary bg-button-primary-bg px-8 py-2 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active">
        立即登录
      </button>
    </section>
  );
}
