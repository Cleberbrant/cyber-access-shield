import { useState, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { detectDevTools } from "@/utils/secure-utils";

/**
 * Contextos de página para comportamento diferenciado do DevTools.
 * - public: página pública (home) — silencioso, sem ação
 * - auth: páginas de login/registro — bloqueia autenticação
 * - authenticated: páginas autenticadas — alerta + log
 * - assessment: durante avaliação — alerta + log de violação
 */
type PageContext = "public" | "auth" | "authenticated" | "assessment";

interface DevToolsDetectionResult {
    /** Se DevTools está detectado como aberto */
    isDevToolsOpen: boolean;
    /** Contexto atual da página */
    pageContext: PageContext;
    /** Se o login deve ser bloqueado (true apenas em contexto 'auth') */
    shouldBlockLogin: boolean;
    /** Se deve mostrar alerta visual */
    shouldShowWarning: boolean;
    /** Se deve registrar como evento de segurança */
    shouldLog: boolean;
}

/**
 * Determina o contexto da página baseado no pathname.
 */
function getPageContext(pathname: string): PageContext {
    if (pathname === "/" || pathname === "/landing") return "public";
    if (pathname === "/login" || pathname === "/register") return "auth";
    if (pathname.startsWith("/assessment/")) return "assessment";
    return "authenticated";
}

/**
 * Hook global de detecção de DevTools com comportamento contextual.
 *
 * Comportamento por contexto:
 * | Página          | Detecta? | Alerta? | Bloqueia login? | Loga? |
 * |-----------------|----------|---------|-----------------|-------|
 * | Home (/)        | ❌       | ❌      | ❌              | ❌    |
 * | Login/Register  | ✅       | ✅      | ✅              | ❌    |
 * | Dashboard/etc   | ✅       | ✅      | ❌              | ✅    |
 * | Assessment      | ✅       | ✅      | ❌              | ✅    |
 *
 * @param isAdmin Se o usuário é admin — admins ignoram detecção
 * @param pollingIntervalMs Intervalo de verificação em ms (padrão: 2000)
 */
export function useDevToolsDetection(
    isAdmin: boolean = false,
    pollingIntervalMs: number = 2000
): DevToolsDetectionResult {
    const [isDevToolsOpen, setIsDevToolsOpen] = useState(false);
    const location = useLocation();

    const pageContext = getPageContext(location.pathname);

    const checkDevTools = useCallback(() => {
        // Admins não são monitorados
        if (isAdmin) {
            setIsDevToolsOpen(false);
            return;
        }
        // Páginas públicas não são monitoradas
        if (pageContext === "public") {
            setIsDevToolsOpen(false);
            return;
        }

        const detected = detectDevTools();
        setIsDevToolsOpen(detected);
    }, [isAdmin, pageContext]);

    useEffect(() => {
        // Não monitorar em contextos que não precisam
        if (isAdmin || pageContext === "public") {
            setIsDevToolsOpen(false);
            return;
        }

        // Verificar imediatamente
        checkDevTools();

        // Polling contínuo
        const interval = setInterval(checkDevTools, pollingIntervalMs);

        return () => clearInterval(interval);
    }, [checkDevTools, pollingIntervalMs, isAdmin, pageContext]);

    // Determinar comportamento baseado no contexto
    const shouldBlockLogin = isDevToolsOpen && pageContext === "auth";
    const shouldShowWarning = isDevToolsOpen && pageContext !== "public";
    const shouldLog = isDevToolsOpen && (pageContext === "authenticated" || pageContext === "assessment");

    return {
        isDevToolsOpen,
        pageContext,
        shouldBlockLogin,
        shouldShowWarning,
        shouldLog,
    };
}
