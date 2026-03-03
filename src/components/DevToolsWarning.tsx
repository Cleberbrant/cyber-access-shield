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
            <div className="max-w-md mx-4 rounded-2xl border border-red-500/30 bg-slate-900 p-8 text-center shadow-2xl shadow-red-500/10">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/20">
                    <ShieldAlert className="h-8 w-8 text-red-400" />
                </div>
                <h2 className="mb-3 text-xl font-bold text-white">{title}</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{description}</p>
                <div className="mt-6 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                    <p className="text-xs text-red-300">{hint}</p>
                </div>
            </div>
        </div>
    );
}
