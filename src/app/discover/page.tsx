import AppShell from "@/components/layout/AppShell";
import HeroSection from "@/components/discover/HeroSection";
import DailyFortune from "@/components/discover/DailyFortune";
import AgentCards from "@/components/discover/AgentCards";
import BaziQuickEntry from "@/components/discover/BaziQuickEntry";
import LoginUnlock from "@/components/discover/LoginUnlock";

export default function DiscoverPage() {
  return (
    <AppShell>
      <div className="flex flex-1 overflow-y-hidden">
        <div className="flex min-h-full w-full justify-center overflow-auto bg-primary-bg-100">
          <div className="relative mx-auto min-h-full w-full min-w-[600px] max-w-7xl px-8 pt-8">
            {/* Background decoration - original: /images/bg_@2.webp */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-full bg-contain bg-top bg-no-repeat opacity-[0.15]"
              aria-hidden="true"
              style={{
                backgroundImage: "linear-gradient(180deg, #f9d19422 0%, transparent 60%)",
              }}
            />
            <div className="relative z-10">
              <HeroSection />
              <DailyFortune />
              <AgentCards />
              <BaziQuickEntry />
              <LoginUnlock />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
