import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  FraudLog,
  AssessmentLogs,
  StudentLogs,
  FraudStats,
  FraudLogsFilters,
} from "@/types/fraud-logs";
import { useToast } from "@/hooks/use-toast";

export function useFraudLogs(filters?: FraudLogsFilters) {
  const [logs, setLogs] = useState<FraudLog[]>([]);
  const [assessmentLogs, setAssessmentLogs] = useState<AssessmentLogs[]>([]);
  const [generalLogs, setGeneralLogs] = useState<FraudLog[]>([]);
  const [stats, setStats] = useState<FraudStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Buscar logs de uma avaliação específica
  const fetchAssessmentLogs = async (
    assessmentId: string
  ): Promise<AssessmentLogs | null> => {
    try {
      const { data, error } = await (supabase as any)
        .from("security_report")
        .select("*")
        .eq("assessment_id", assessmentId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      console.log(
        `📊 Logs encontrados para avaliação ${assessmentId}:`,
        data?.length
      );
      console.log(
        "📋 Tipos de eventos encontrados:",
        data?.map((l) => l.event_type)
      );

      if (!data || data.length === 0) return null;

      // Primeiro, coletar todas as sessões únicas com suas datas
      const sessionInfoMap = new Map<
        string,
        { userId: string; createdAt: string }
      >();

      for (const log of data) {
        if (!sessionInfoMap.has(log.session_id)) {
          const { data: sessionData } = await (supabase as any)
            .from("assessment_sessions")
            .select("user_id, created_at")
            .eq("id", log.session_id)
            .single();

          if (sessionData) {
            sessionInfoMap.set(log.session_id, {
              userId: sessionData.user_id,
              createdAt: sessionData.created_at,
            });
          }
        }
      }

      // Calcular número da tentativa para cada sessão
      const attemptNumberMap = new Map<string, number>();
      const userSessions = new Map<
        string,
        Array<{ sessionId: string; createdAt: string }>
      >();

      // Agrupar sessões por usuário
      for (const [sessionId, info] of sessionInfoMap.entries()) {
        if (!userSessions.has(info.userId)) {
          userSessions.set(info.userId, []);
        }
        userSessions
          .get(info.userId)!
          .push({ sessionId, createdAt: info.createdAt });
      }

      // Ordenar sessões de cada usuário e atribuir números de tentativa
      for (const [userId, sessions] of userSessions.entries()) {
        sessions.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        sessions.forEach((session, index) => {
          attemptNumberMap.set(session.sessionId, index + 1);
        });
      }

      // Agrupar por estudante + sessão (para separar tentativas múltiplas)
      const studentMap = new Map<string, StudentLogs>();

      for (const log of data) {
        // Chave única: user_id + session_id para separar tentativas
        const key = `${log.user_id}_${log.session_id}`;

        if (!studentMap.has(key)) {
          // Buscar IP da sessão (qualquer log da sessão, não apenas assessment_started)
          const { data: sessionStartLog } = await (supabase as any)
            .from("security_logs")
            .select("ip_address")
            .eq("session_id", log.session_id)
            .order("created_at", { ascending: true })
            .limit(1)
            .maybeSingle();

          const attemptNumber = attemptNumberMap.get(log.session_id) || 1;

          studentMap.set(key, {
            student_id: log.user_id,
            student_email: log.user_email || "Desconhecido",
            student_name: log.user_name
              ? `${log.user_name} (Tentativa ${attemptNumber})`
              : `Tentativa ${attemptNumber}`,
            session_ip: sessionStartLog?.ip_address || null,
            logs: [],
            total_violations: 0,
          });
        }

        const student = studentMap.get(key)!;
        student.logs.push(log);
        student.total_violations++;
      }

      const assessmentData = data[0];

      // Contar alunos únicos (não tentativas)
      const uniqueStudentIds = new Set(
        Array.from(studentMap.values()).map((s) => s.student_id)
      );

      return {
        assessment_id: assessmentId,
        assessment_title: assessmentData?.assessment_title || "Avaliação",
        students: Array.from(studentMap.values()),
        total_students_with_logs: uniqueStudentIds.size,
        total_violations: data.length,
      };
    } catch (error) {
      console.error("Erro ao buscar logs da avaliação:", error);
      return null;
    }
  };

  // Buscar logs gerais (fora de avaliações)
  const fetchGeneralLogs = async (): Promise<FraudLog[]> => {
    try {
      const { data, error } = await (supabase as any)
        .from("security_report")
        .select("*")
        .is("assessment_id", null)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error("Erro ao buscar logs gerais:", error);
      return [];
    }
  };

  // Buscar todos os logs de todas as avaliações
  const fetchAllAssessmentLogs = async (): Promise<AssessmentLogs[]> => {
    try {
      // Buscar avaliações únicas com logs
      const { data: assessmentsData, error } = await (supabase as any)
        .from("security_report")
        .select("assessment_id, assessment_title")
        .not("assessment_id", "is", null)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (!assessmentsData || assessmentsData.length === 0) return [];

      // Obter IDs únicos
      const uniqueAssessments = Array.from(
        new Map(
          assessmentsData.map((item) => [
            item.assessment_id,
            item.assessment_title,
          ])
        ).entries()
      );

      // Buscar logs de cada avaliação
      const assessmentLogsPromises = uniqueAssessments.map(([id]) =>
        fetchAssessmentLogs(id!)
      );

      const results = await Promise.all(assessmentLogsPromises);
      return results.filter(Boolean) as AssessmentLogs[];
    } catch (error) {
      console.error("Erro ao buscar logs de avaliações:", error);
      return [];
    }
  };

  // Calcular estatísticas
  const calculateStats = (allLogs: FraudLog[]): FraudStats => {
    const eventTypeCounts: Record<string, number> = {};
    const uniqueStudents = new Set<string>();
    const uniqueAssessments = new Set<string>();

    for (const log of allLogs) {
      eventTypeCounts[log.event_type] =
        (eventTypeCounts[log.event_type] || 0) + 1;
      uniqueStudents.add(log.user_id);
      if (log.assessment_id) {
        uniqueAssessments.add(log.assessment_id);
      }
    }

    return {
      total_logs: allLogs.length,
      total_students_flagged: uniqueStudents.size,
      total_assessments_with_logs: uniqueAssessments.size,
      by_event_type: eventTypeCounts,
      recent_logs: allLogs.slice(0, 10),
    };
  };

  // Carregar dados
  const loadData = async () => {
    setLoading(true);
    try {
      const [assessments, general] = await Promise.all([
        fetchAllAssessmentLogs(),
        fetchGeneralLogs(),
      ]);

      setAssessmentLogs(assessments);
      setGeneralLogs(general);

      // Combinar todos os logs para estatísticas
      const allLogs = [
        ...assessments.flatMap((a) => a.students.flatMap((s) => s.logs)),
        ...general,
      ];

      setLogs(allLogs);
      setStats(calculateStats(allLogs));
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar os logs de fraude.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    logs,
    assessmentLogs,
    generalLogs,
    stats,
    loading,
    refetch: loadData,
  };
}
