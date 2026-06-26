"use client";

export default function ChatWindow() {
  return (
    <div className="flex h-full flex-col bg-primary-bg-100">
      <div className="flex-1 overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-serif-heading text-h4 font-semibold text-foreground-third">
            参天AI 对话
          </h2>
          <div className="mt-8 space-y-4">
            <div className="rounded-2xl bg-card p-4 text-body text-foreground-second">
              您好！我是参天AI助手，请问有什么可以帮您的？
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-border bg-card p-4">
        <div className="mx-auto max-w-3xl">
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="输入您的问题..."
              className="flex-1 rounded-xl border border-border bg-background px-4 py-3 text-body text-foreground-second outline-none transition-colors focus:border-border-primary"
            />
            <button className="rounded-xl bg-button-primary-bg px-6 py-3 text-body font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active">
              发送
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
