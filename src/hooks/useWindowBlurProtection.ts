import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { logSecurityEvent, SecurityEventType } from "@/utils/secure-utils";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para detectar quando aluno sai da aba/janela durante avaliação
 * Implementa sistema de avisos progressivos e cancelamento após 3 violações
 * Valida tempo fora da aba (5 segundos) para evitar falsos positivos
 * Contador contínuo: incrementa a cada 5 segundos fora da aba
 *
 * @param isActive - Se a proteção deve estar ativa
 * @param assessmentId - ID da avaliação atual
 * @param sessionId - ID da sessão de avaliação
 */
export function useWindowBlurProtection(
  isActive: boolean,
  assessmentId?: string,
  sessionId?: string
) {
  const { toast } = useToast();
  const navigate = useNavigate();

  // Contador de violações (carregado do banco)
  const [warningCount, setWarningCount] = useState(0);

  // Refs para controlar tempo fora da aba
  const blurStartTime = useRef<number | null>(null);
  const blurTimeoutId = useRef<NodeJS.Timeout | null>(null);
  const continuousIntervalId = useRef<NodeJS.Timeout | null>(null);
  const isCurrentlyBlurred = useRef<boolean>(false);

  // Carregar contador de avisos do banco ao montar
  useEffect(() => {
    const loadWarningCount = async () => {
      if (!sessionId) return;

      const { data, error } = await supabase
        .from("assessment_sessions")
        .select("warning_count")
        .eq("id", sessionId)
        .single();

      if (!error && data) {
        setWarningCount(data.warning_count || 0);
      }
    };

    loadWarningCount();
  }, [sessionId]);

  useEffect(() => {
    if (!isActive) return;

    // =========================================================================
    // FUNÇÃO PARA PROCESSAR VIOLAÇÃO
    // =========================================================================

    // Função para processar violação (após 5 segundos fora ou contínua)
    const handleBlurViolation = async (details: string) => {
      // Incrementar contador no banco de dados
      if (!sessionId) return;

      try {
        const { data, error } = await supabase.rpc("increment_warning_count", {
          p_session_id: sessionId,
        });

        if (error) throw error;

        const newWarningCount = data || warningCount + 1;
        setWarningCount(newWarningCount);

        // Registrar evento no banco
        await logSecurityEvent({
          type: SecurityEventType.WINDOW_BLUR,
          timestamp: new Date().toISOString(),
          details: `${details} (Violação ${newWarningCount}/3)`,
          assessmentId,
          sessionId,
        });

        // Sistema de avisos progressivos
        if (newWarningCount === 1) {
          // PRIMEIRO AVISO
          toast({
            title: "⚠️ Primeiro Aviso",
            description:
              "Detectamos que você saiu da aba da prova. Permaneça na aba para continuar.",
            variant: "destructive",
            duration: 6000,
          });
        } else if (newWarningCount === 2) {
          // SEGUNDO AVISO (mais severo)
          toast({
            title: "⛔ Segundo Aviso - ATENÇÃO",
            description:
              "Segunda violação detectada! Uma terceira violação cancelará sua prova automaticamente.",
            variant: "destructive",
            duration: 8000,
          });
        } else if (newWarningCount >= 3) {
          // TERCEIRO AVISO - CANCELAR PROVA
          await cancelAssessment();
        }
      } catch (error) {
        console.error("Erro ao processar violação:", error);
      }
    };

    // =========================================================================
    // FUNÇÃO PARA CANCELAR AVALIAÇÃO
    // =========================================================================

    // Função para cancelar a avaliação
    const cancelAssessment = async () => {
      try {
        // Parar todos os timers
        cancelBlurDetection();

        // Registrar evento de cancelamento
        await logSecurityEvent({
          type: SecurityEventType.ASSESSMENT_CANCELLED,
          timestamp: new Date().toISOString(),
          details:
            "Avaliação cancelada automaticamente por 3 violações de saída da aba",
          assessmentId,
          sessionId,
        });

        // Marcar sessão como cancelada no banco
        if (sessionId) {
          await supabase
            .from("assessment_sessions")
            .update({
              is_completed: true,
              is_cancelled: true,
              cancellation_reason:
                "Cancelada por 3 violações de saída da aba/janela",
              completed_at: new Date().toISOString(),
              score: 0,
            })
            .eq("id", sessionId);
        }

        // Limpar flags
        localStorage.removeItem("assessmentInProgress");

        // Mostrar toast final
        toast({
          title: "🚫 Avaliação Cancelada",
          description:
            "Sua avaliação foi cancelada devido a múltiplas violações de segurança.",
          variant: "destructive",
          duration: 10000,
        });

        // Redirecionar para resultado após 2 segundos
        setTimeout(() => {
          navigate(`/assessment-result/${assessmentId}`);
        }, 2000);
      } catch (error) {
        console.error("Erro ao cancelar avaliação:", error);
      }
    };

    // =========================================================================
    // FUNÇÕES UNIFICADAS DE CONTROLE
    // =========================================================================

    /**
     * Inicia detecção de blur (timeout inicial de 5s + contador contínuo)
     */
    const startBlurDetection = () => {
      // Se já está em blur, não fazer nada
      if (isCurrentlyBlurred.current) return;

      isCurrentlyBlurred.current = true;
      blurStartTime.current = Date.now();

      // Timeout inicial: aguarda 5 segundos antes da primeira violação
      blurTimeoutId.current = setTimeout(() => {
        handleBlurViolation(
          "Primeira detecção: Aluno fora da aba por 5+ segundos"
        );

        // Após primeira violação, iniciar contador contínuo (a cada 5s)
        continuousIntervalId.current = setInterval(() => {
          handleBlurViolation("Violação contínua: Aluno ainda fora da aba");
        }, 5000);
      }, 5000);
    };

    /**
     * Cancela detecção de blur (limpa todos os timers)
     */
    const cancelBlurDetection = () => {
      isCurrentlyBlurred.current = false;

      // Limpar timeout inicial
      if (blurTimeoutId.current) {
        clearTimeout(blurTimeoutId.current);
        blurTimeoutId.current = null;
      }

      // Limpar intervalo contínuo
      if (continuousIntervalId.current) {
        clearInterval(continuousIntervalId.current);
        continuousIntervalId.current = null;
      }

      // Registrar retorno se ficou fora tempo suficiente
      if (blurStartTime.current) {
        const timeAway = Date.now() - blurStartTime.current;

        if (timeAway >= 5000) {
          const secondsAway = Math.floor(timeAway / 1000);
          logSecurityEvent({
            type: SecurityEventType.WINDOW_FOCUS,
            timestamp: new Date().toISOString(),
            details: `Aluno retornou após ${secondsAway} segundos fora`,
            assessmentId,
            sessionId,
          });
        }

        blurStartTime.current = null;
      }
    };

    // =========================================================================
    // EVENT HANDLERS
    // =========================================================================

    // Handler para visibilitychange (troca de aba, minimizar janela)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        startBlurDetection();
      } else {
        cancelBlurDetection();
      }
    };

    // Handler para window blur (Alt+Tab, click fora da janela)
    const handleWindowBlur = () => {
      startBlurDetection();
    };

    // Handler para window focus (retorno)
    const handleWindowFocus = () => {
      cancelBlurDetection();
    };

    // =========================================================================
    // ADICIONAR EVENT LISTENERS
    // =========================================================================

    // Adicionar listeners
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    window.addEventListener("focus", handleWindowFocus);

    // Cleanup
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      window.removeEventListener("focus", handleWindowFocus);

      // Limpar todos os timers
      cancelBlurDetection();
    };
  }, [isActive, assessmentId, sessionId, toast, navigate]);

  return { warningCount };
}
