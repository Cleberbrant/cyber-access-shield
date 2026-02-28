import { describe, it, expect } from "vitest";
import {
    maskIP,
    formatEventType,
    getEventSeverity,
    formatTimestamp,
    formatRelativeTime,
} from "../fraud-logs-utils";

describe("maskIP", () => {
    it("deve retornar 'N/A' para null", () => {
        expect(maskIP(null)).toBe("N/A");
    });

    it("deve mascarar IPv4 corretamente", () => {
        expect(maskIP("192.168.1.100")).toBe("192.168.*.***");
    });

    it("deve mascarar outro IPv4", () => {
        expect(maskIP("10.0.0.1")).toBe("10.0.*.***");
    });

    it("deve mascarar IPv6", () => {
        const result = maskIP("2001:0db8:85a3:0000:0000:8a2e:0370:7334");
        expect(result).toContain("2001");
        expect(result).toContain("****");
    });

    it("deve mascarar formato desconhecido", () => {
        const result = maskIP("unknown-format-ip");
        expect(result).toContain("****");
    });
});

describe("formatEventType", () => {
    it("deve formatar devtools_opened", () => {
        expect(formatEventType("devtools_opened")).toBe("DevTools Aberto");
    });

    it("deve formatar copy_attempt", () => {
        expect(formatEventType("copy_attempt")).toBe("Tentativa de Cópia");
    });

    it("deve formatar tab_switch", () => {
        expect(formatEventType("tab_switch")).toBe("Troca de Aba");
    });

    it("deve formatar window_blur", () => {
        expect(formatEventType("window_blur")).toBe("Saiu da Janela");
    });

    it("deve retornar tipo original se não encontrar tradução", () => {
        expect(formatEventType("unknown_event")).toBe("unknown_event");
    });

    it("deve formatar assessment_started", () => {
        expect(formatEventType("assessment_started")).toBe("Avaliação Iniciada");
    });

    it("deve formatar assessment_cancelled", () => {
        expect(formatEventType("assessment_cancelled")).toBe("Avaliação Cancelada");
    });

    it("deve formatar context_menu_attempt", () => {
        expect(formatEventType("context_menu_attempt")).toBe("Menu de Contexto");
    });

    it("deve formatar paste_attempt", () => {
        expect(formatEventType("paste_attempt")).toBe("Tentativa de Colar");
    });

    it("deve formatar cut_attempt", () => {
        expect(formatEventType("cut_attempt")).toBe("Tentativa de Recorte");
    });

    it("deve formatar print_attempt", () => {
        expect(formatEventType("print_attempt")).toBe("Tentativa de Impressão");
    });

    it("deve formatar keyboard_shortcut", () => {
        expect(formatEventType("keyboard_shortcut")).toBe("Atalho de Teclado");
    });

    it("deve formatar window_focus", () => {
        expect(formatEventType("window_focus")).toBe("Retornou à Janela");
    });

    it("deve formatar fullscreen_exit", () => {
        expect(formatEventType("fullscreen_exit")).toBe("Saiu de Tela Cheia");
    });
});

describe("getEventSeverity", () => {
    it("deve retornar destructive para eventos críticos", () => {
        expect(getEventSeverity("devtools_opened").badge).toBe("destructive");
        expect(getEventSeverity("tab_switch").badge).toBe("destructive");
        expect(getEventSeverity("assessment_cancelled").badge).toBe("destructive");
    });

    it("deve retornar default para eventos médios", () => {
        expect(getEventSeverity("copy_attempt").badge).toBe("default");
        expect(getEventSeverity("context_menu_attempt").badge).toBe("default");
        expect(getEventSeverity("print_attempt").badge).toBe("default");
        expect(getEventSeverity("cut_attempt").badge).toBe("default");
        expect(getEventSeverity("paste_attempt").badge).toBe("default");
    });

    it("deve retornar secondary para eventos desconhecidos", () => {
        expect(getEventSeverity("unknown_event").badge).toBe("secondary");
    });

    it("deve retornar cores corretas", () => {
        expect(getEventSeverity("devtools_opened").color).toBe("text-destructive");
        expect(getEventSeverity("copy_attempt").color).toContain("yellow");
        expect(getEventSeverity("unknown_event").color).toBe("text-cyber-blue");
    });
});

describe("formatTimestamp", () => {
    it("deve formatar timestamp no padrão PT-BR", () => {
        const result = formatTimestamp("2025-06-15T10:30:45Z");
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});

describe("formatRelativeTime", () => {
    it("deve retornar 'agora mesmo' para data recente", () => {
        const now = new Date().toISOString();
        expect(formatRelativeTime(now)).toBe("agora mesmo");
    });

    it("deve retornar minutos", () => {
        const fiveMinAgo = new Date(Date.now() - 5 * 60000).toISOString();
        expect(formatRelativeTime(fiveMinAgo)).toBe("há 5 minutos");
    });

    it("deve retornar horas", () => {
        const twoHoursAgo = new Date(Date.now() - 2 * 3600000).toISOString();
        expect(formatRelativeTime(twoHoursAgo)).toBe("há 2 horas");
    });

    it("deve retornar dias", () => {
        const threeDaysAgo = new Date(Date.now() - 3 * 86400000).toISOString();
        expect(formatRelativeTime(threeDaysAgo)).toBe("há 3 dias");
    });

    it("deve retornar timestamp formatado para mais de 7 dias", () => {
        const tenDaysAgo = new Date(Date.now() - 10 * 86400000).toISOString();
        const result = formatRelativeTime(tenDaysAgo);
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});
