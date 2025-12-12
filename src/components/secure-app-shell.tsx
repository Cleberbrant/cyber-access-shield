import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useSessionCheck } from "@/hooks/useSessionCheck";
import { useAssessmentProtection } from "@/hooks/useAssessmentProtection";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

interface SecureAppShellProps {
  children: React.ReactNode;
}

export function SecureAppShell({ children }: SecureAppShellProps) {
  const navigate = useNavigate();
  const { user } = useSessionCheck();
  useAssessmentProtection();

  const handleLogout = async () => {
    // Limpar localStorage antes de fazer logout
    localStorage.removeItem("isAdmin");
    localStorage.removeItem("assessmentInProgress");

    await supabase.auth.signOut();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header user={user} onLogout={handleLogout} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
