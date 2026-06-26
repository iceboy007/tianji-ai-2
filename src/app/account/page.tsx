import AppShell from "@/components/layout/AppShell";
import AccountContent from "@/components/account/AccountContent";

export default function AccountPage() {
  return (
    <AppShell>
      <div className="h-full overflow-y-auto bg-primary-bg-100">
        <div className="mx-auto max-w-2xl px-4 pt-8">
          <AccountContent />
        </div>
      </div>
    </AppShell>
  );
}
