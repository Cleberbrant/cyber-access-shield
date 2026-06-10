import { ShieldAlert } from "lucide-react";

interface DevToolsWarningProps {
    /** Contexto atual — afeta a mensagem exibida */
    context: "auth" | "authenticated" | "assessment";
}

/**
 * Overlay visual fullscreen que aparece quando DevTools é detectado.
 * Bloqueia a interação em TODOS os contextos (auth, authenticated, assessment).
 * Admins são isentos — este componente não deve ser renderizado para eles.
 */
export function DevToolsWarning({ context }: DevToolsWarningProps) {
    const messages = {
        auth: {
            title: "Ferramentas de Desenvolvedor Detectadas",
            description:
                "Para sua segurança, o login está bloqueado enquanto as ferramentas de desenvolvedor estiverem abertas. Feche-as e tente novamente.",
            hint: "Feche as ferramentas de desenvolvedor (F12) para desbloquear o acesso.",
        },
        authenticated: {
            title: "Ferramentas de Desenvolvedor Detectadas",
            description:
                "O uso de ferramentas de desenvolvedor não é permitido na plataforma. Feche-as para continuar utilizando o sistema.",
            hint: "Feche as ferramentas de desenvolvedor (F12) para desbloquear a plataforma.",
        },
        assessment: {
            title: "Violação de Segurança — Avaliação",
            description:
                "O uso de ferramentas de desenvolvedor durante a avaliação é uma violação das regras. Esta ação foi registrada e pode resultar no cancelamento da prova.",
            hint: "Feche as ferramentas de desenvolvedor (F12) imediatamente.",
        },
    };

    const { title, description, hint } = messages[context];

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="max-w-md mx-4 rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-2xl shadow-destructive/10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20">
                    <ShieldAlert className="h-8 w-8 text-destructive" />
                </div>
                <h2 className="mb-3 font-display text-xl font-bold text-foreground">{title}</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                <div className="mt-6 rounded-lg bg-destructive/10 border border-destructive/20 p-3">
                    <p className="text-xs text-destructive">{hint}</p>
                </div>
            </div>
        </div>
    );
}
