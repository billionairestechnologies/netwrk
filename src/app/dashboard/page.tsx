import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import DashboardView from "@/components/dashboard-view";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const [{ data: memories }, { data: permissions }, { data: auditLog }] = await Promise.all([
    supabase.from("memories").select("id, content, source, created_at").order("created_at", { ascending: false }),
    supabase.from("permissions").select("id, scope, autonomy_tier, granted, updated_at").order("scope"),
    supabase.from("audit_log").select("id, actor, action, scope, created_at").order("created_at", { ascending: false }).limit(50),
  ]);

  return (
    <DashboardView
      memories={memories ?? []}
      permissions={permissions ?? []}
      auditLog={auditLog ?? []}
    />
  );
}
