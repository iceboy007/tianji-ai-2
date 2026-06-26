import AppShell from "@/components/layout/AppShell";
import ReportList from "@/components/reports/ReportList";

export default function ReportsPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-primary-bg-100 px-8 pt-8">
        <ReportList />
      </div>
    </AppShell>
  );
}
