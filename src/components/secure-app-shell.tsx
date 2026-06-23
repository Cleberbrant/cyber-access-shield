import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { useAssessmentProtection } from "@/hooks/useAssessmentProtection";
import { Header } from "@/components/layout/Header";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

interface SecureAppShellProps {
  children: React.ReactNode;
  /** "sidebar" (padrão) = shell SaaS; "focus" = modo prova sem sidebar */
  layout?: "sidebar" | "focus";
}

export function SecureAppShell({
  children,
  layout = "sidebar",
}: SecureAppShellProps) {
  const navigate = useNavigate();
  const { user } = useSessionCheck();
  useAssessmentProtection();

  const handleLogout = async () => {
    // Limpar localStorage antes de fazer logout
    localStorage.removeItem("assessmentInProgress");

    await supabase.auth.signOut();
    navigate("/login");
  };

  if (layout === "focus") {
    return (
      <div className="min-h-screen flex flex-col">
        <Header user={user} onLogout={handleLogout} variant="focus" />
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <AppSidebar user={user} onLogout={handleLogout} />
      <SidebarInset>
        <Header user={user} onLogout={handleLogout} />
        <main className="flex-1">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
