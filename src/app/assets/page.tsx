import AppShell from "@/components/layout/AppShell";
import AssetsContent from "@/components/assets/AssetsContent";

export default function AssetsPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-primary-bg-100 px-8 pt-8">
        <AssetsContent />
      </div>
    </AppShell>
  );
}
