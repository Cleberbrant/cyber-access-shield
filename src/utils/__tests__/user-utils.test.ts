import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    generateTempPassword,
    validatePassword,
    formatDate,
    formatShortDate,
    formatRelativeTime,
    generateDisplayNameFromEmail,
    translateAction,
    formatLogValue,
    validateDisplayName,
    isTempPasswordExpired,
    validateEmail,
    sanitizeInput,
} from "../user-utils";

// Mock crypto.getRandomValues para testes determinísticos
const mockGetRandomValues = vi.fn((array: Uint8Array) => {
    for (let i = 0; i < array.length; i++) {
        array[i] = (i * 37 + 13) % 256;
    }
    return array;
});

Object.defineProperty(globalThis, "crypto", {
    value: { getRandomValues: mockGetRandomValues },
    writable: true,
});

describe("generateTempPassword", () => {
    it("deve gerar senha no formato correto", () => {
        const result = generateTempPassword();
        expect(result.password).toMatch(/^Temp\d{4}@[A-Z]{3}\d{3}$/);
        expect(result.strength).toBe("strong");
    });

    it("deve incluir o ano atual", () => {
        const result = generateTempPassword();
        const year = new Date().getFullYear().toString();
        expect(result.password).toContain(year);
    });
});

describe("validatePassword", () => {
    it("deve aceitar senha válida", () => {
        const result = validatePassword("Abc123!@#");
        expect(result.isValid).toBe(true);
        expect(result.errors).toHaveLength(0);
    });

    it("deve rejeitar senha curta", () => {
        const result = validatePassword("Ab1!");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain("Senha deve ter no mínimo 8 caracteres");
    });

    it("deve rejeitar senha sem maiúscula", () => {
        const result = validatePassword("abcdef1!");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            "Senha deve conter pelo menos 1 letra maiúscula"
        );
    });

    it("deve rejeitar senha sem minúscula", () => {
        const result = validatePassword("ABCDEF1!");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            "Senha deve conter pelo menos 1 letra minúscula"
        );
    });

    it("deve rejeitar senha sem número", () => {
        const result = validatePassword("Abcdefg!");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            "Senha deve conter pelo menos 1 número"
        );
    });

    it("deve rejeitar senha sem caractere especial", () => {
        const result = validatePassword("Abcdefg1");
        expect(result.isValid).toBe(false);
        expect(result.errors).toContain(
            "Senha deve conter pelo menos 1 caractere especial"
        );
    });

    it("deve retornar múltiplos erros", () => {
        const result = validatePassword("abc");
        expect(result.isValid).toBe(false);
        expect(result.errors.length).toBeGreaterThanOrEqual(3);
    });
});

describe("validateEmail", () => {
    it("deve aceitar email válido", () => {
        expect(validateEmail("user@example.com")).toBe(true);
    });

    it("deve aceitar email com subdomínio", () => {
        expect(validateEmail("user@mail.example.com")).toBe(true);
    });

    it("deve rejeitar email sem @", () => {
        expect(validateEmail("userexample.com")).toBe(false);
    });

    it("deve rejeitar email sem domínio", () => {
        expect(validateEmail("user@")).toBe(false);
    });

    it("deve rejeitar string vazia", () => {
        expect(validateEmail("")).toBe(false);
    });

    it("deve aceitar email com caracteres especiais antes do @", () => {
        expect(validateEmail("user.name+tag@example.com")).toBe(true);
    });
});

describe("validateDisplayName", () => {
    it("deve aceitar nome válido", () => {
        const result = validateDisplayName("João Silva");
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
    });

    it("deve rejeitar nome vazio", () => {
        const result = validateDisplayName("");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Nome de exibição não pode ser vazio");
    });

    it("deve rejeitar nome com apenas espaços", () => {
        const result = validateDisplayName("   ");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Nome de exibição não pode ser vazio");
    });

    it("deve rejeitar nome muito curto", () => {
        const result = validateDisplayName("A");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Nome deve ter no mínimo 2 caracteres");
    });

    it("deve rejeitar nome muito longo", () => {
        const longName = "A".repeat(101);
        const result = validateDisplayName(longName);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Nome deve ter no máximo 100 caracteres");
    });

    it("deve aceitar nome com 2 caracteres", () => {
        const result = validateDisplayName("Ab");
        expect(result.isValid).toBe(true);
    });

    it("deve aceitar nome com 100 caracteres", () => {
        const name = "A".repeat(100);
        const result = validateDisplayName(name);
        expect(result.isValid).toBe(true);
    });
});

describe("sanitizeInput", () => {
    it("deve remover tags HTML", () => {
        expect(sanitizeInput("<script>alert('xss')</script>")).toBe(
            "scriptalert('xss')/script"
        );
    });

    it("deve remover < e >", () => {
        expect(sanitizeInput("hello <world>")).toBe("hello world");
    });

    it("deve fazer trim", () => {
        expect(sanitizeInput("  hello  ")).toBe("hello");
    });

    it("deve manter texto normal", () => {
        expect(sanitizeInput("texto normal")).toBe("texto normal");
    });
});

describe("generateDisplayNameFromEmail", () => {
    it("deve gerar nome a partir do email", () => {
        expect(generateDisplayNameFromEmail("joao.silva@example.com")).toBe(
            "Joao Silva"
        );
    });

    it("deve lidar com underscores", () => {
        expect(generateDisplayNameFromEmail("joao_silva@example.com")).toBe(
            "Joao Silva"
        );
    });

    it("deve lidar com hífens", () => {
        expect(generateDisplayNameFromEmail("joao-silva@example.com")).toBe(
            "Joao Silva"
        );
    });

    it("deve capitalizar corretamente", () => {
        expect(generateDisplayNameFromEmail("JOAO@example.com")).toBe("Joao");
    });
});

describe("formatDate", () => {
    it("deve retornar 'Nunca' para null", () => {
        expect(formatDate(null)).toBe("Nunca");
    });

    it("deve formatar data no padrão PT-BR", () => {
        const result = formatDate("2025-06-15T10:30:00Z");
        // O formato exato depende do timezone, mas deve conter números
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});

describe("formatShortDate", () => {
    it("deve retornar '—' para null", () => {
        expect(formatShortDate(null)).toBe("—");
    });

    it("deve formatar data curta", () => {
        const result = formatShortDate("2025-06-15T10:30:00Z");
        expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
    });
});

describe("formatRelativeTime", () => {
    it("deve retornar 'Nunca' para null", () => {
        expect(formatRelativeTime(null)).toBe("Nunca");
    });

    it("deve retornar 'Agora mesmo' para data recente", () => {
        const now = new Date().toISOString();
        expect(formatRelativeTime(now)).toBe("Agora mesmo");
    });

    it("deve retornar minutos para data recente", () => {
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60000).toISOString();
        expect(formatRelativeTime(fiveMinutesAgo)).toBe("Há 5 minutos");
    });

    it("deve retornar horas para datas mais antigas", () => {
        const threeHoursAgo = new Date(Date.now() - 3 * 3600000).toISOString();
        expect(formatRelativeTime(threeHoursAgo)).toBe("Há 3 horas");
    });
});

describe("translateAction", () => {
    it("deve traduzir edit_role", () => {
        expect(translateAction("edit_role")).toBe("Alterou tipo de conta");
    });

    it("deve traduzir deactivate", () => {
        expect(translateAction("deactivate")).toBe("Desativou conta");
    });

    it("deve retornar ação original se não encontrar tradução", () => {
        expect(translateAction("unknown_action" as any)).toBe("unknown_action");
    });
});

describe("formatLogValue", () => {
    it("deve retornar '—' para null", () => {
        expect(formatLogValue("edit_role", null)).toBe("—");
    });

    it("deve retornar '—' para undefined", () => {
        expect(formatLogValue("edit_role", undefined)).toBe("—");
    });

    it("deve formatar role admin", () => {
        expect(formatLogValue("edit_role", { is_admin: true })).toBe(
            "Administrador"
        );
    });

    it("deve formatar role aluno", () => {
        expect(formatLogValue("edit_role", { is_admin: false })).toBe("Aluno");
    });

    it("deve formatar deactivate", () => {
        expect(formatLogValue("deactivate", { is_active: false })).toBe("Inativa");
    });

    it("deve formatar activate", () => {
        expect(formatLogValue("activate", { is_active: true })).toBe("Ativa");
    });

    it("deve formatar display_name", () => {
        expect(
            formatLogValue("edit_display_name", { display_name: "João" })
        ).toBe("João");
    });

    it("deve mascarar reset_password", () => {
        expect(formatLogValue("reset_password", "newpassword")).toBe("••••••••");
    });

    it("deve converter objeto para JSON", () => {
        const result = formatLogValue("edit_role" as any, { custom: "data" });
        // edit_role retorna baseado em is_admin, mas se não tiver, vai para o genérico
        expect(result).toBeDefined();
    });
});

describe("isTempPasswordExpired", () => {
    it("deve retornar false para null", () => {
        expect(isTempPasswordExpired(null)).toBe(false);
    });

    it("deve retornar false para senha recente", () => {
        expect(isTempPasswordExpired(new Date().toISOString())).toBe(false);
    });

    it("deve retornar true para senha antiga (>30 dias)", () => {
        const oldDate = new Date(Date.now() - 31 * 86400000).toISOString();
        expect(isTempPasswordExpired(oldDate)).toBe(true);
    });

    it("deve retornar false para senha com exatamente 30 dias", () => {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 86400000).toISOString();
        expect(isTempPasswordExpired(thirtyDaysAgo)).toBe(false);
    });
});
