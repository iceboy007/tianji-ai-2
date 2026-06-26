import AppShell from "@/components/layout/AppShell";
import BaziForm from "@/components/bazi/BaziForm";

export default function HomePage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-primary-bg-100">
        <div className="mx-auto max-w-7xl px-8 pt-8">
          <BaziForm />
        </div>
      </div>
    </AppShell>
  );
}
