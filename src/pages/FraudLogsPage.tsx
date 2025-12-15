import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SecureAppShell } from "@/components/secure-app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, FileText, AlertCircle } from "lucide-react";
import { useFraudLogs } from "@/hooks/useFraudLogs";
import { FraudLogsHeader } from "@/components/fraud-logs/FraudLogsHeader";
import { AssessmentLogCard } from "@/components/fraud-logs/AssessmentLogCard";
import { GeneralLogsSection } from "@/components/fraud-logs/GeneralLogsSection";
import { FraudStatsCard } from "@/components/fraud-logs/FraudStatsCard";
import { isAdmin } from "@/utils/secure-utils";
import { useToast } from "@/hooks/use-toast";

export default function FraudLogsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const { assessmentLogs, generalLogs, stats, loading, refetch } =
    useFraudLogs();

  // Verificar se é admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      const adminStatus = await isAdmin();
      setIsUserAdmin(adminStatus);

      if (!adminStatus) {
        toast({
          title: "Acesso negado",
          description:
            "Apenas administradores podem acessar os logs de fraude.",
          variant: "destructive",
        });
        navigate("/dashboard");
      }

      setCheckingAuth(false);
    };

    checkAdminStatus();
  }, [navigate, toast]);

  if (checkingAuth) {
    return (
      <SecureAppShell>
        <div className="container py-8">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
            <span>Verificando permissões...</span>
          </div>
        </div>
      </SecureAppShell>
    );
  }

  if (!isUserAdmin) {
    return null;
  }

  return (
    <SecureAppShell>
      <div className="container py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar ao Dashboard
        </Button>

        <FraudLogsHeader onRefresh={refetch} isLoading={loading} />

        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary mr-2" />
              <span>Carregando logs...</span>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Estatísticas */}
            {stats && <FraudStatsCard stats={stats} />}

            {/* Tabs de navegação */}
            <Tabs defaultValue="assessments" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger
                  value="assessments"
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Por Avaliação
                </TabsTrigger>
                <TabsTrigger
                  value="general"
                  className="flex items-center gap-2"
                >
                  <AlertCircle className="h-4 w-4" />
                  Logs Gerais
                </TabsTrigger>
              </TabsList>

              {/* Tab: Por Avaliação */}
              <TabsContent value="assessments" className="mt-6">
                {assessmentLogs.length === 0 ? (
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center py-12">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-xl font-semibold mb-1">
                        Nenhum log de avaliação encontrado
                      </h3>
                      <p className="text-muted-foreground text-center max-w-md">
                        Não há registros de eventos de segurança em avaliações.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-6">
                    {assessmentLogs.map((assessment) => (
                      <AssessmentLogCard
                        key={assessment.assessment_id}
                        assessmentLogs={assessment}
                      />
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Tab: Logs Gerais */}
              <TabsContent value="general" className="mt-6">
                <GeneralLogsSection logs={generalLogs} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </SecureAppShell>
  );
}
