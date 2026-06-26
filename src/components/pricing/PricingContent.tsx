"use client";

import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

interface PricingPlan {
  id: string;
  emoji: string;
  name: string;
  description: string;
  price: string;
  unit: string;
  duration: string;
  benefits: string[];
  isHot?: boolean;
  isBusiness?: boolean;
}

const plans: PricingPlan[] = [
  {
    id: "free",
    emoji: "🆓",
    name: "免费用户",
    description: "基础功能体验",
    price: "0",
    unit: "美元",
    duration: "永久",
    benefits: ["每日1次免费咨询", "基础八字排盘", "档案保存（限3份）"],
  },
  {
    id: "daily",
    emoji: "🌖",
    name: "1日限时会员",
    description: "体验全部功能",
    price: "4.99",
    unit: "美元",
    duration: "/1日",
    benefits: ["无限次AI咨询", "完整八字分析", "解锁全部报告", "参天石×10"],
  },
  {
    id: "weekly",
    emoji: "🔥",
    name: "1周先锋会员",
    description: "深度体验之旅",
    price: "9.99",
    unit: "美元",
    duration: "/7天",
    benefits: ["无限次AI咨询", "完整八字分析", "解锁全部报告", "参天石×50", "优先客服支持"],
    isHot: true,
  },
  {
    id: "monthly",
    emoji: "🔮",
    name: "尊享月度会员",
    description: "连续包月，随时取消",
    price: "19.99",
    unit: "美元",
    duration: "/月",
    benefits: ["无限次AI咨询", "完整八字分析", "解锁全部报告", "参天石×100", "专属AI大师", "优先客服支持"],
  },
  {
    id: "coins100",
    emoji: "⛽️",
    name: "100参天石礼包",
    description: "一次性购买，永久有效",
    price: "4.99",
    unit: "美元",
    duration: "/永久",
    benefits: ["100参天石", "可用于解锁报告", "可用于兑换消息额度", "永久有效"],
  },
  {
    id: "exchange",
    emoji: "💬",
    name: "兑换聊天额度",
    description: "参天石→消息条数",
    price: "按需",
    unit: "",
    duration: "",
    benefits: ["灵活兑换", "按需使用", "剩余参天石不过期"],
  },
  {
    id: "business",
    emoji: "💼",
    name: "商务套餐",
    description: "企业级定制方案",
    price: "联系",
    unit: "",
    duration: "我们",
    benefits: ["企业专属定制", "API接口接入", "专属客服团队", "定制化报告"],
    isBusiness: true,
  },
];

export default function PricingContent() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="text-center">
        <h1 className="font-serif-heading text-h2 font-bold text-foreground-third">
          套餐定价
        </h1>
        <p className="mt-2 text-body-small text-muted-foreground">
          选择您的套餐
        </p>
      </div>

      {/* Scroll Controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-opacity disabled:opacity-30"
        >
          <ChevronLeft className="h-5 w-5 text-foreground-second" />
        </button>
        <button
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card transition-opacity disabled:opacity-30"
        >
          <ChevronRight className="h-5 w-5 text-foreground-second" />
        </button>
      </div>

      {/* Pricing Cards */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex gap-4 overflow-x-auto hide-scrollbar pb-4"
      >
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative shrink-0 w-72 min-h-[420px] rounded-2xl border bg-card p-5 flex flex-col ${
              plan.isHot ? "border-foreground-primary shadow-lg" : "border-border"
            }`}
          >
            {/* HOT Badge - original: /images/hot.svg */}
            {plan.isHot && (
              <div className="absolute -top-3 right-3 rounded-full bg-red-500 px-3 py-1 text-tip-small font-bold text-white">
                HOT
              </div>
            )}

            {/* Plan Header */}
            <div>
              <h3 className="font-serif-heading text-h5 font-bold text-foreground-third">
                {plan.emoji} {plan.name}
              </h3>
              <p className="mt-1 text-body-small text-text-secondary">
                {plan.description}
              </p>
            </div>

            {/* Price */}
            <div className="mt-4">
              <span className="text-h2 font-bold text-foreground-third">
                {plan.price === "联系" || plan.price === "按需" ? (
                  plan.price
                ) : (
                  <>${plan.price}</>
                )}
              </span>
              {(plan.price !== "联系" && plan.price !== "按需") && (
                <>
                  <span className="text-body-small text-text-secondary">
                    {plan.unit}
                  </span>
                  <span className="text-body-small text-muted-foreground">
                    {plan.duration}
                  </span>
                </>
              )}
              {plan.price === "联系" && (
                <span className="text-body-small text-muted-foreground">
                  {plan.duration}
                </span>
              )}
            </div>

            {/* Subscribe Button */}
            <button className="mt-4 w-full rounded-full bg-button-primary-bg h-10 text-body-small font-medium text-button-foreground transition-colors hover:bg-button-primary-bg-active">
              {plan.isBusiness ? "联系我们" : "订阅服务"}
            </button>

            {/* Benefits */}
            <div className="mt-4 flex-1 space-y-2">
              {plan.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-foreground-primary" />
                  <span className="text-body-small text-foreground-second">
                    {benefit}
                  </span>
                </div>
              ))}
            </div>

            {/* Disclaimer for paid plans */}
            {plan.id !== "free" && !plan.isBusiness && (
              <div className="mt-3 space-y-0.5 text-tip-small text-muted-foreground">
                <p>* 报告解锁后永久有效</p>
                <p>* 参天石不会过期</p>
                <p>* 可重复购买叠加</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
