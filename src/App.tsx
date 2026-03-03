import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Dashboard from "./pages/Dashboard";
import AssessmentPage from "./pages/AssessmentPage";
import AssessmentResultPage from "./pages/AssessmentResultPage";
import CreateAssessmentPage from "./pages/CreateAssessmentPage";
import FraudLogsPage from "./pages/FraudLogsPage";
import UserManagementPage from "./pages/UserManagementPage";
import NotFound from "./pages/NotFound";
import { useDevToolsDetection } from "./hooks/useDevToolsDetection";
import { DevToolsWarning } from "./components/DevToolsWarning";
import { logSecurityEvent, SecurityEventType } from "./utils/secure-utils";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppRoutes() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar se o usuário logado é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_admin")
          .eq("id", session.user.id)
          .single();
        setIsAdmin(profile?.is_admin === true);
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminStatus();

    // Reagir a mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAdminStatus();
    });
    return () => subscription.unsubscribe();
  }, []);

  const { isDevToolsOpen, pageContext, shouldShowWarning, shouldLog } =
    useDevToolsDetection(isAdmin);

  // Logar evento apenas uma vez por detecção (evitar spam)
  const hasLoggedRef = useRef(false);

  useEffect(() => {
    if (shouldLog && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      logSecurityEvent({
        type: SecurityEventType.DEVTOOLS_OPENED,
        timestamp: new Date().toISOString(),
        details: `DevTools detectado em: ${pageContext}`,
      });
    }
    if (!isDevToolsOpen) {
      hasLoggedRef.current = false;
    }
  }, [shouldLog, isDevToolsOpen, pageContext]);

  return (
    <>
      {shouldShowWarning && pageContext !== "public" && (
        <DevToolsWarning context={pageContext as "auth" | "authenticated" | "assessment"} />
      )}
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route
          path="/assessment/:assessmentId"
          element={<AssessmentPage />}
        />
        <Route
          path="/assessment-result/:assessmentId"
          element={<AssessmentResultPage />}
        />
        <Route path="/create-assessment" element={<CreateAssessmentPage />} />
        <Route
          path="/edit-assessment/:id"
          element={<CreateAssessmentPage />}
        />
        <Route path="/fraud-logs" element={<FraudLogsPage />} />
        <Route path="/user-management" element={<UserManagementPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
