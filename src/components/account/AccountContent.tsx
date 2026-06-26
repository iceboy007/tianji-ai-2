"use client";

import { ChevronRight, Mail, Smartphone, Gift, Brain, Receipt, History } from "lucide-react";

export default function AccountContent() {
  return (
    <div className="space-y-6 pb-12">
      {/* Account Info Card */}
      <div className="rounded-xl border border-border bg-card px-6 py-4 space-y-3">
        <h2 className="font-serif-heading text-h5 font-bold text-foreground-third">
          账户信息
        </h2>
        <div className="space-y-2 text-body-small">
          <div className="flex justify-between">
            <span className="text-muted-foreground">邮箱:</span>
            <span className="text-foreground-second">user@example.com</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">手机号:</span>
            <span className="text-foreground-second">-</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">消息额度:</span>
            <span className="text-foreground-second">1条（免费1条，兑换0条）</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">参天石:</span>
            <span className="flex items-center gap-1">
              {/* Placeholder - original: /images/coins.png */}
              <span>⭐</span>
              <span className="text-foreground-second font-medium">100</span>
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">会员等级:</span>
            <span className="rounded-full bg-primary-bg-200 px-2 py-0.5 text-tip-small text-foreground-primary">
              免费用户
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">会员到期时间:</span>
            <span className="text-foreground-second">-</span>
          </div>
        </div>
        <p className="text-tip-small text-muted-foreground">
          如有疑问请联系 support@cantian.ai
        </p>
      </div>

      {/* Account & Service List */}
      <div className="space-y-2">
        {[
          { icon: Mail, title: "账号绑定", desc: "绑定邮箱或手机号，保障账号安全", status: "已绑定" },
          { icon: Gift, title: "邀请码绑定", desc: "绑定邀请码，获取专属奖励", status: "未绑定" },
          { icon: Gift, title: "礼包兑换", desc: "输入礼包码，兑换权益", status: "" },
          { icon: Brain, title: "记忆管理", desc: "管理我的记忆，提升个性化体验", status: "已开启 / 0条记忆" },
          { icon: Receipt, title: "订阅记录", desc: "", status: "" },
          { icon: History, title: "消费记录", desc: "", status: "" },
        ].map((item) => (
          <div
            key={item.title}
            className="flex cursor-pointer items-center justify-between rounded-lg bg-card px-4 py-3 transition-colors hover:bg-primary-bg-100 border border-border"
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-muted-foreground" />
              <div>
                <div className="text-body-small font-medium text-foreground-second">
                  {item.title}
                </div>
                {item.desc && (
                  <div className="text-tip-small text-muted-foreground">
                    {item.desc}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-1">
              {item.status && (
                <span className="text-body-small text-muted-foreground">
                  {item.status}
                </span>
              )}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
