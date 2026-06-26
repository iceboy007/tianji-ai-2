import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif-heading text-hero font-bold text-foreground-third">
            参天AI
          </h1>
          <p className="mt-4 text-body-medium text-foreground-second">
            AI驱动的中国传统命理分析平台
          </p>
          <p className="mt-2 text-body text-muted-foreground">
            探索您的命运密码，了解自我，规划未来
          </p>
        </div>
        <Link
          href="/chat/cantian"
          className="flex shrink-0 items-center gap-2 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 px-6 py-4 text-white shadow-lg transition-transform hover:scale-105 hover:shadow-xl"
        >
          <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <div className="text-left">
            <div className="text-body font-bold">AI 对话</div>
            <div className="text-tip-small opacity-80">立即咨询命理大师</div>
          </div>
        </Link>
      </div>
    </section>
  );
}
