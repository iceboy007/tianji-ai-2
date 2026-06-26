import AppShell from "@/components/layout/AppShell";
import PricingContent from "@/components/pricing/PricingContent";

export default function PricingPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-primary-bg-100 px-8 pt-8">
        <PricingContent />
      </div>
    </AppShell>
  );
}
